import { ISyllabusHaver } from "@ueu/ueu-canvas";
import { create } from "zustand";

// TODO; This maybe should go somewhere else in file hierarchy

type SyllabusState = {
  originalHtml: string;
  draftHtml: string;
  status: "idle" | "loading" | "loaded" | "saving" | "success" | "error";
  validationResults: string[];
  fetchSyllabus: (course: ISyllabusHaver) => Promise<void>;
  updateSyllabus: (course: ISyllabusHaver, html: string) => Promise<void>;
};

export const useSyllabusStore = create<SyllabusState>((set, get) => ({
  originalHtml: "", // What is pulled from Canvas
  draftHtml: "", // The currently modified version
  status: "idle", // 'validating', 'saving', 'success', 'error'
  validationResults: [], // List of discovered issues

  fetchSyllabus: async (course: ISyllabusHaver) => {
    if (get().originalHtml !== "") return;

    useSyllabusStore.setState({ status: "loading", originalHtml: "", draftHtml: "" });
    try {
      const syllabus = await course.getSyllabus();
      set({ originalHtml: syllabus, draftHtml: syllabus, status: "loaded" });
    } catch (e) {
      set({ status: "error", validationResults: ["Error fetching syllabus", e as string] });
    }
  },

  updateSyllabus: async (course: ISyllabusHaver, html: string) => {
    set({ status: "saving" });

    if (html === get().originalHtml) {
      set({ status: "success", validationResults: ["No changes needed!"] });
      return;
    }

    try {
      await course.changeSyllabus(html);
      set({ status: "success" });
    } catch (e) {
      set({ status: "error", validationResults: ["Error saving syllabus: ", e as string] });
    }
  },
}));
