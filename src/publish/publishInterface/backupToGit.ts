import { storage } from "webextension-polyfill";
import { fetchJson } from "@ueu/ueu-canvas/fetch/fetchJson";
import { Course } from "@ueu/ueu-canvas/course/Course";
import { formDataify } from "@ueu/ueu-canvas/canvasUtils";
import { GITHUB_TOKEN_KEY } from "@/consts";
import { GITHUB_BACKUP_ORG } from "@/publish/consts";

const GITHUB_API_BASE = "https://api.github.com";
const DEFAULT_BRANCH = "main";
// GitHub's documented blob limit is 100MB, but in practice the blob creation endpoint
// rejects requests well below that ("input was too large to process") - keep chunks
// small enough (and base64 inflates raw bytes by ~4/3) to stay clear of that lower ceiling.
const CHUNK_RAW_BYTES = 25_000_000;

export interface BackupBpToGitOptions {
  course: Course;
  repoName?: string;
  org?: string;
  branch?: string;
}

interface GithubTreeItem {
  path: string;
  mode: "100644";
  type: "blob";
  sha: string;
}

async function getGithubToken(): Promise<string> {
  const record = await storage.local.get(GITHUB_TOKEN_KEY);
  const token = record[GITHUB_TOKEN_KEY] as string | undefined;
  if (!token) {
    throw new Error(
      "No GitHub token saved. Add one in the extension popup under Advanced Options before backing up to git."
    );
  }
  return token;
}

async function githubErrorDetail(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

async function ensureGithubRepo(repoName: string, org: string, token: string) {
  const checkResponse = await fetch(`${GITHUB_API_BASE}/repos/${org}/${repoName}`, {
    headers: githubHeaders(token),
  });
  if (checkResponse.status === 404) {
    const createResponse = await fetch(`${GITHUB_API_BASE}/orgs/${org}/repos`, {
      method: "POST",
      headers: githubHeaders(token),
      body: JSON.stringify({ name: repoName, private: true, auto_init: true }),
    });
    if (!createResponse.ok) {
      throw new Error(
        `Failed to create GitHub repo ${org}/${repoName}: ${createResponse.status} ${createResponse.statusText} ${await githubErrorDetail(createResponse)}`
      );
    }
    console.log(`Created GitHub repo: ${org}/${repoName}`);
    return;
  }
  if (!checkResponse.ok) {
    throw new Error(
      `Failed to check GitHub repo ${org}/${repoName}: ${checkResponse.status} ${checkResponse.statusText} ${await githubErrorDetail(checkResponse)}`
    );
  }
  console.log(`Repo already exists: ${org}/${repoName}`);
}

async function getBranchHeadSha(org: string, repoName: string, branch: string, token: string): Promise<string | null> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${org}/${repoName}/git/ref/heads/${branch}`, {
    headers: githubHeaders(token),
  });
  // A brand new repo with no commits yet returns 409 ("Git Repository is empty") rather than 404.
  if (response.status === 404 || response.status === 409) return null;
  if (!response.ok) {
    throw new Error(
      `Failed to get ref heads/${branch} for ${org}/${repoName}: ${response.status} ${response.statusText} ${await githubErrorDetail(response)}`
    );
  }
  const refData = await response.json();
  return refData.object.sha as string;
}

async function createBlob(org: string, repoName: string, token: string, contentBase64: string): Promise<string> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${org}/${repoName}/git/blobs`, {
    method: "POST",
    headers: githubHeaders(token),
    body: JSON.stringify({ content: contentBase64, encoding: "base64" }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create blob: ${response.status} ${response.statusText} ${await githubErrorDetail(response)}`);
  }
  const blobData = await response.json();
  return blobData.sha as string;
}

async function createTree(org: string, repoName: string, token: string, treeItems: GithubTreeItem[]): Promise<string> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${org}/${repoName}/git/trees`, {
    method: "POST",
    headers: githubHeaders(token),
    body: JSON.stringify({ tree: treeItems }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create tree: ${response.status} ${response.statusText} ${await githubErrorDetail(response)}`);
  }
  const treeData = await response.json();
  return treeData.sha as string;
}

async function createCommit(
  org: string,
  repoName: string,
  token: string,
  message: string,
  treeSha: string,
  parentSha: string | null
): Promise<string> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${org}/${repoName}/git/commits`, {
    method: "POST",
    headers: githubHeaders(token),
    body: JSON.stringify({
      message,
      tree: treeSha,
      parents: parentSha ? [parentSha] : [],
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create commit: ${response.status} ${response.statusText} ${await githubErrorDetail(response)}`);
  }
  const commitData = await response.json();
  return commitData.sha as string;
}

async function updateGithubRef(
  org: string,
  repoName: string,
  token: string,
  branch: string,
  commitSha: string,
  branchExists: boolean
): Promise<void> {
  const url = branchExists
    ? `${GITHUB_API_BASE}/repos/${org}/${repoName}/git/refs/heads/${branch}`
    : `${GITHUB_API_BASE}/repos/${org}/${repoName}/git/refs`;
  const response = await fetch(url, {
    method: branchExists ? "PATCH" : "POST",
    headers: githubHeaders(token),
    body: JSON.stringify(branchExists ? { sha: commitSha, force: true } : { ref: `refs/heads/${branch}`, sha: commitSha }),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to update ref heads/${branch}: ${response.status} ${response.statusText} ${await githubErrorDetail(response)}`
    );
  }
}

async function waitForExportCompletion(courseId: number, progressUrl: string, intervalMs = 3000, timeoutMs = 300000) {
  const start = Date.now();
  while (true) {
    const progress = await fetchJson(progressUrl);
    if (progress.workflow_state === "completed") return;
    if (progress.workflow_state === "failed") {
      throw new Error(`Content export for course ${courseId} failed.`);
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Content export for course ${courseId} timed out after ${timeoutMs / 1000}s.`);
    }
    console.log(`Export still ${progress.workflow_state}... waiting ${intervalMs / 1000}s`);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

async function downloadCourseExportZip(courseId: number): Promise<{ filename: string; bytes: Uint8Array }> {
  const contentExport = await fetchJson(`/api/v1/courses/${courseId}/content_exports`, {
    fetchInit: {
      method: "POST",
      body: formDataify({ export_type: "common_cartridge" }),
    },
  });

  if (!contentExport.progress_url) {
    throw new Error(`Failed to start content export for course ${courseId}: ${JSON.stringify(contentExport)}`);
  }
  await waitForExportCompletion(courseId, contentExport.progress_url);

  const completedExport = await fetchJson(`/api/v1/courses/${courseId}/content_exports/${contentExport.id}`);
  const attachmentUrl = completedExport.attachment?.url;
  if (!attachmentUrl) {
    throw new Error(`Content export for course ${courseId} completed without an attachment.`);
  }
  const filename = completedExport.attachment?.filename ?? `course-${courseId}-export.imscc`;

  const fileResponse = await fetch(attachmentUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to download content export file: ${fileResponse.status} ${fileResponse.statusText}`);
  }
  const bytes = new Uint8Array(await fileResponse.arrayBuffer());
  return { filename, bytes };
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function chunkBytes(bytes: Uint8Array, chunkSize: number): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(bytes.subarray(i, i + chunkSize));
  }
  return chunks.length ? chunks : [bytes];
}

export async function backupBpToGit({
  course,
  repoName = course.parsedCourseCode ?? `course-${course.id}`,
  org = GITHUB_BACKUP_ORG,
  branch = DEFAULT_BRANCH,
}: BackupBpToGitOptions): Promise<void> {
  const token = await getGithubToken();

  console.log(`Exporting course ${course.id} for git backup...`);
  const { filename, bytes } = await downloadCourseExportZip(course.id);

  const chunks = chunkBytes(bytes, CHUNK_RAW_BYTES);
  console.log(
    `Downloaded export ${filename} (${bytes.length} bytes) as ${chunks.length} part(s). Pushing to GitHub ${org}/${repoName}...`
  );

  await ensureGithubRepo(repoName, org, token);
  const parentSha = await getBranchHeadSha(org, repoName, branch, token);

  const partNames: string[] = [];
  const treeItems: GithubTreeItem[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const partName = chunks.length > 1 ? `${filename}.part${String(i + 1).padStart(3, "0")}` : filename;
    const blobSha = await createBlob(org, repoName, token, uint8ArrayToBase64(chunks[i]));
    treeItems.push({ path: partName, mode: "100644", type: "blob", sha: blobSha });
    partNames.push(partName);
  }

  if (chunks.length > 1) {
    const reassembleNote =
      `This export was split into ${chunks.length} parts because it exceeds GitHub's single-file size limit.\n\n` +
      `To reassemble on macOS/Linux:\n  cat ${partNames.join(" ")} > ${filename}\n\n` +
      `On Windows (cmd.exe):\n  copy /b ${partNames.join("+")} ${filename}\n`;
    const noteBlobSha = await createBlob(org, repoName, token, btoa(reassembleNote));
    treeItems.push({ path: `${filename}.README.txt`, mode: "100644", type: "blob", sha: noteBlobSha });
  }

  const treeSha = await createTree(org, repoName, token, treeItems);
  const commitMessage = `Course export backup ${new Date().toISOString()}`;
  const commitSha = await createCommit(org, repoName, token, commitMessage, treeSha, parentSha);
  await updateGithubRef(org, repoName, token, branch, commitSha, parentSha !== null);

  console.log(`Backed up course ${course.id} to https://github.com/${org}/${repoName}`);
}
