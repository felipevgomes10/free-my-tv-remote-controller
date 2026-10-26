import { configure } from "@testing-library/dom";

// Test files run in parallel; a first render can take over the default second under load.
configure({ asyncUtilTimeout: 3000 });
