const container = document.querySelector(".container");
const foundation = document.querySelector("[data-foundation]");
const discovery = document.querySelector("[data-discovery]");
const delivery = document.querySelector("[data-delivery]");

// Requests
const url = "http://ilona.intersys.com.ua";

const getData = async (url) => {
  let response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Could not fetch request on ${url}, status ${response.status}`
    );
  }

  return await response.json();
};

const foundationPhaseFetch = (url) => {
  const phaseUrl = `${url}/questions.json`;

  getData(phaseUrl)
    .then(({data}) => {
      if (!isArray(data)) location.reload();

      createTasks(data, "[data-foundation] .task-list", "[data-foundation]");
      discoveryPhase(data.length);

      localStorage.setItem("foundationTaskList", JSON.stringify(data));
    })
    .catch((error) => console.error(error));
};

const discoveryPhaseFetch = (url, taskNum) => {
  const phaseUrl = `${url}/questions.json?i=${taskNum}`;

  getData(phaseUrl)
    .then(({data}) => {
      if (!isArray(data)) location.reload();

      createTasks(data, "[data-discovery] .task-list", "[data-discovery]");
      deliveryPhase(data.length);

      localStorage.setItem("discoveryTaskList", JSON.stringify(data));
    })
    .catch((error) => console.error(error));
};

const deliveryPhaseFetch = (url, taskNum) => {
  const phaseUrl = `${url}/questions.json?i=${taskNum}`;

  getData(phaseUrl)
    .then(({data}) => {
      if (!isArray(data)) location.reload();

      createTasks(data, "[data-delivery] .task-list", "[data-delivery]");

      localStorage.setItem("deliveryTaskList", JSON.stringify(data));
    })
    .catch((error) => console.error(error));
};

const finishedPhases = (url) => {
  const phaseUrl = `${url}/result.json`;

  getData(phaseUrl)
    .then(({data}) => {
      if (!isArray(data)) location.reload();

      createResultMessage(data, ".container");

      localStorage.setItem("finishedPhases", JSON.stringify(data));
    })
    .catch((error) => console.error(error));
};

function discoveryPhase(prevTaskNumArr) {
  discoveryPhaseFetch(url, prevTaskNumArr);
}

function deliveryPhase(prevTaskNumArr) {
  deliveryPhaseFetch(url, prevTaskNumArr);
}

function isArray(value) {
  return Array.isArray(value);
}

// Tasks render
const foundationTaskList = [];
const discoveryTaskList = [];
const deliveryTaskList = [];

function createTasks(response, wrapper, phaseAttribute = null) {
  response.forEach(({text}) => {
    let task = document.createElement("li");

    task.classList.add("task-item");

    task.innerHTML = `
      <label class="task-item-control control--checkbox">${text}
        <input type="checkbox" data-input />
        <span class="control-indicator"></span>
      </label>
    `;

    if (phaseAttribute) {
      switch (phaseAttribute) {
        case "[data-foundation]":
          foundationTaskList.push(task);
          break;

        case "[data-discovery]":
          discoveryTaskList.push(task);
          break;

        case "[data-delivery]":
          deliveryTaskList.push(task);
          break;

        default:
          console.log(`Sorry, we are out of ${phaseAttribute}.`);
      }
    }

    document.querySelector(wrapper).appendChild(task);
  });
}

// When all phases are completed, render a random fact
function createResultMessage(response, wrapper) {
  const randomMessage = getRandomInt(response.length);

  const message = response.find((_, idx) => idx === randomMessage);

  let resultBlock = document.createElement("div");

  resultBlock.classList.add("js-inner");

  resultBlock.innerHTML = `
    <h2 class="js-title-item">${message.result}</h2>
    <button class="js-btn">Show new startup</button>
  `;

  document.querySelector(wrapper).appendChild(resultBlock);

  document.querySelector(".stages-list").remove();

  newFetchBtn();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function newFetchBtn() {
  const btn = document.querySelector(".js-btn");

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    localStorage.clear();
    location.reload();
  });
}

// Render from local storage
function updateDOM() {
  const foundationLocalList = JSON.parse(
    localStorage.getItem("foundationTaskList")
  );

  const discoveryLocalList = JSON.parse(
    localStorage.getItem("discoveryTaskList")
  );

  const deliveryLocalList = JSON.parse(
    localStorage.getItem("deliveryTaskList")
  );

  const finishedLocalList = JSON.parse(localStorage.getItem("finishedPhases"));

  if (foundationLocalList !== null && foundationLocalList.length > 0) {
    createTasks(foundationLocalList, "[data-foundation] .task-list");
  }

  if (discoveryLocalList !== null && discoveryLocalList.length > 0) {
    createTasks(discoveryLocalList, "[data-discovery] .task-list");
  }

  if (deliveryLocalList !== null && deliveryLocalList.length > 0) {
    createTasks(deliveryLocalList, "[data-delivery] .task-list");
  }

  if (finishedLocalList !== null && finishedLocalList.length > 0) {
    createResultMessage(finishedLocalList, ".container");
  }
}

// Control of all checked items
const checkedFoundationArr = [];
const checkedDiscoveryArr = [];
const checkedDeliveryArr = [];

function stageChecker(event, stageList, checkedArr) {
  event.target.checked
    ? checkedArr.push(event.target.checked)
    : checkedArr.pop(event.target.checked);

  const checkPhaseList = event.target.offsetParent.offsetParent;

  const checkNextPhaseListSibling =
    event.target.offsetParent.offsetParent.nextElementSibling;

  if (stageList.length === checkedArr.length) {
    checkPhaseList.classList.add("js-stage--checked");

    if (checkNextPhaseListSibling) {
      checkNextPhaseListSibling.classList.remove("js-stage--disabled");
    }
  }
}

container.addEventListener("change", (e) => {
  const checkPhaseList = e.target.offsetParent.offsetParent;

  if (checkPhaseList === foundation) {
    stageChecker(e, foundationTaskList, checkedFoundationArr);

    localStorage.setItem(
      "checkedFoundationArr",
      JSON.stringify(checkedFoundationArr)
    );
  } else if (checkPhaseList === discovery) {
    stageChecker(e, discoveryTaskList, checkedDiscoveryArr);

    localStorage.setItem(
      "checkedFoundationArr",
      JSON.stringify(checkedDiscoveryArr)
    );
  } else {
    stageChecker(e, deliveryTaskList, checkedDeliveryArr);

    localStorage.setItem(
      "checkedFoundationArr",
      JSON.stringify(checkedDeliveryArr)
    );
  }

  if (delivery.classList.contains("js-stage--checked")) {
    finishedPhases(url);
  }
});

window.addEventListener("DOMContentLoaded", () => {
  // !localStorage.getItem("foundationTaskList")
  //   ? foundationPhaseFetch(url)
  //   : updateDOM();

  foundationPhaseFetch(url);
});
