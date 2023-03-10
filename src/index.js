const React = require("react");
const { render } = require("react-dom");
import { whenOdysseyLoaded } from "@abcnews/env-utils";

const PROJECT_NAME = "interactive-i-have-the-best-news";
const root = document.querySelector(`[data-${PROJECT_NAME}-root]`);

async function init() {
  await whenOdysseyLoaded;

  const stage = document.querySelector(".scrollyteller-stage");

  if (stage === null) {
    return setTimeout(init, 500);
  }

  const App = require("./components/App");
  render(<App projectName={PROJECT_NAME} />, stage);
}

init();

if (module.hot) {
  module.hot.accept("./components/App", () => {
    try {
      init();
    } catch (err) {
      const ErrorBox = require("./components/ErrorBox");
      render(<ErrorBox error={err} />, root);
    }
  });
}

if (process.env.NODE_ENV === "development") {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
