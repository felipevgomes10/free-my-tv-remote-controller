import { configure } from "@testing-library/dom";

// Test files run in parallel; a first render can take over the default second under load.
configure({ asyncUtilTimeout: 3000 });

// jsdom has no native dialog methods. Browser checks cover modal focus and dismissal.
HTMLDialogElement.prototype.showModal = function () { this.open = true; };
HTMLDialogElement.prototype.close = function () { this.open = false; };
