import {badContentRunFunc} from "@publish/fixesAndUpdates/validations/utils";
import React, {FormEvent, useEffect, useState} from "react";
import {Alert, Button, Col, Form, Row} from "react-bootstrap";
import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";

interface ICustomSearchValidationParams {
    onGenerateSearchValidation(generatedValidation: CourseValidation): void,
}

export function CustomSearchValidation({
    onGenerateSearchValidation
}: ICustomSearchValidationParams) {
  const [queryString, setQueryString] = useState('');
  const [parseRegex, setParseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [isValidRegex, setIsValidRegex] = useState(false);

  // 1) New state to toggle the success message
  const [showSuccess, setShowSuccess] = useState(false);

  // 2) Auto‐hide after 3 s whenever we show it
  useEffect(() => {
    if (!showSuccess) return;
    const timer = window.setTimeout(() => setShowSuccess(false), 3000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  function validateRegex(pattern: string, flags?: string) {
    try {
      return new RegExp(pattern, flags);
    } catch {
      return false;
    }
  }

  useEffect(() => {
    setIsValidRegex(!!validateRegex(queryString));
  }, [queryString]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    const stringRepresentation = parseRegex
      ? `/${queryString}/`
      : queryString;
    const patternToUse = parseRegex
      ? queryString
      : escapedQueryStringRegex(queryString);
    const regex = validateRegex(
      patternToUse,
      caseSensitive ? "g" : "ig"
    );
    if (!regex) {
      console.warn(`${patternToUse} is not a valid regular expression`);
      return;
    }

    onGenerateSearchValidation({
      name: `custom search: ${stringRepresentation}`,
      description: `Course content DOES NOT ${
        parseRegex ? "match pattern" : "contain text"
      } ${stringRepresentation}`,
      run: badContentRunFunc(regex),
    });

    // 3) Show the confirmation
    setShowSuccess(true);

    return false;
  }

  return (
    <>
      <Form onSubmit={onSubmit}>
        <Row>
          <BooleanCheck
            label="Search with Regular Expressions"
            value={parseRegex}
            setValue={setParseRegex}
          />
        </Row>
        <Row>
          <BooleanCheck
            label="Case Sensitive"
            value={caseSensitive}
            setValue={setCaseSensitive}
          />
        </Row>
        <Row>
          <Col>
            <Form.Label>Search For:</Form.Label>
            <Form.Control
              type="text"
              value={queryString}
              onChange={(e) => setQueryString(e.target.value)}
            />
            <Button onClick={onSubmit}>Add Test</Button>
          </Col>
        </Row>
        {parseRegex && !isValidRegex && (
          <Row>
            <Col className="alert alert-danger">
              {queryString} is not a valid regular expression.
            </Col>
          </Row>
        )}
        {parseRegex && <Row><Col>
          <a href={'https://regexone.com/'}>This site</a> has a tutorial on how to use regular expressions.
        </Col></Row>}
      </Form>

      {/* Render the success alert */}
      {showSuccess && (
        <Alert variant="success" className="mt-3">
          Test added! Run tests to see results.
        </Alert>
      )}
    </>
  );
}

function escapedQueryStringRegex(query: string) {
    return query.replaceAll(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

interface IBooleanCheckedProps {
    label: string,
    value: boolean,
    setValue: (value: boolean) => any
}

function BooleanCheck({ value, label, setValue }: IBooleanCheckedProps) {
  return (
    <>
      <Col sm={6}>
        <Form.Label>{label}</Form.Label>
      </Col>
      <Col sm={6}>
        <Form.Check
          checked={value}
          onChange={(e) => setValue(e.target.checked)}
        ></Form.Check>
      </Col>
    </>
  );
}