//App functions
var SlateApp = (function () {
  //set default variables
  this.uploadQueue = [];
  this.uploadQueueSlates = [];

  this.pageData = {
    title: document.title,
    source: window.location.href,
  };

  function SlateApp() {
    //Create app
  }

  SlateApp.prototype.init = async () => {
    async function loadUploads(files) {
      //console.log('Page files: ', files);
      files.map((item) => {
        let div = document.createElement("div");
        div.className = "slate-upload-file-module";
        let container = document.createElement("div");
        container.className = "slate-upload-file";
        let spinner = document.createElement("div");
        spinner.className = "slate-loaderspinner";
        let fileName = document.createElement("div");
        fileName.className = "slate-upload-file-name";
        fileName.innerHTML = item.file.altTitle;

        div.appendChild(container);
        container.appendChild(spinner);
        container.appendChild(fileName);
        document.getElementById("slate-upload-file-modules").appendChild(div);
      });

      //console.log('All page files: ', files);
    }

    try {
      $.get(chrome.extension.getURL("./app/pages/app.html"), function (data) {
        $(data).prependTo("body");
      })
        .done(function () {
          //
          //
          //Initilize app event listeners
          document
            .getElementById("slate-close-icon")
            .addEventListener("click", function () {
              location.reload();
            });

          document
            .getElementById("slate-settings-icon")
            .addEventListener("click", function () {
              chrome.runtime.sendMessage({
                message: "settings",
              });
            });

          document
            .getElementById("slate-upload-btn")
            .addEventListener("click", function () {
              //console.log("Upload queue:", uploadQueue);
              //var searchList = [{ test1: 1 }, { test2: 2 }];
              var isUploadQueue = JSON.stringify(uploadQueue);
              var isPageTitle = JSON.stringify(pageData);
              var isApiData = JSON.stringify(uploadQueueSlates);

              //console.log("Page data:", isPageTitle);

              chrome.runtime.sendMessage({
                uploadData: "slate",
                data: isUploadQueue,
                page: isPageTitle,
                api: isApiData,
              });

              document
                .getElementById("slate-drawer-upload")
                .classList.toggle("active");
              document
                .getElementById("slate-drawer-upload-progress")
                .classList.toggle("active");
            });

          return true;
          //
          //
          //End app listeners
        })
        .fail(function () {
          return false;
        });
      return true;
    } catch (error) {
      console.error(error);
    }
  };

  SlateApp.prototype.getPageFiles = async () => {
    let allFiles = [];
    let filesArray = [];
    let fetchImages = $("body")
      .find("img")
      .map(function () {
        return this;
      })
      .get();
    Array.prototype.map.call(fetchImages, function (i) {
      allFiles.push(i);
    });
    let position = 0;
    for (let i = 0; i < allFiles.length; i++) {
      position++;
      const id = Math.random().toString(36).substr(2, 9);
      const type = "img";
      if (allFiles[i].naturalWidth > 100) {
        filesArray.push({
          id: id,
          src: allFiles[i].src,
          altTitle: allFiles[i].alt || null,
          type: type,
          page_position: position,
          width: allFiles[i].naturalwidth,
          height: allFiles[i].naturalHeight,
        });
      }
    }
    return filesArray;
  };

  SlateApp.prototype.getPageData = async () => {
    this.pageData.title = document.title;
    this.pageData.source = window.location.href;
    return pageData;
  };

  SlateApp.prototype.listFiles = async (props, apiKeys) => {
    try {
      $.getScript(chrome.extension.getURL("./app/index.js"), function (data) {
        $(data).append("body");
      })
        .done(function () {
          props.forEach(function (file) {
            let div = document.createElement("div");
            div.className = "slate-img-container slate-masonry-item";
            let img = document.createElement("img");
            img.className = "slate-list_img";
            img.id = "img-" + file.id;
            if (file.type == "img") {
              img.src = file.src;
            }

            let checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            checkbox.value = file.src;
            checkbox.id = "check-" + file.id;
            checkbox.className = "slate-img-checkbox";

            let customCheckbox = document.createElement("div");
            customCheckbox.className = "slate-custom-checkbox";
            customCheckbox.innerHTML =
              '<svg class="slate-custom-checkbox-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

            div.onclick = async () => {
              this.uploadQueue.push({ file });
              if (this.uploadQueue.length > 0) {
                document
                  .getElementById("slate-upload-btn")
                  .classList.remove("disabled");

                if (this.uploadQueue.length == 1) {
                  document.getElementById("slate-popup-title-name").innerHTML =
                    "Upload 1 file to Slate";
                } else {
                  document.getElementById("slate-popup-title-name").innerHTML =
                    "Upload " + this.uploadQueue.length + " files to Slate";
                }
              }
              //console.log("File added to queue: ", this.uploadQueue);
              let customCheckIcon = customCheckbox.childNodes[0];
              if (!checkbox.checked) {
                checkbox.checked = true;
                customCheckbox.className = "slate-custom-checkbox checked";
                customCheckIcon.classList.add("checked");
                img.classList.add("selected");
                div.classList.add("selected");
              } else {
                checkbox.checked = false;
                customCheckbox.className = "slate-custom-checkbox";
                customCheckIcon.classList.remove("checked");
                img.classList.remove("selected");
                div.classList.remove("selected");
              }
              //await SelectFile(item);
            };

            div.appendChild(checkbox);
            div.appendChild(img);
            div.appendChild(customCheckbox);
            document.getElementById("slate-image-grid").appendChild(div);
          });
          //console.log("Slates from api keys: ", apiKeys);
          apiKeys.forEach(function (slate) {
            //console.log("Slate info: ", slate.slates);

            var slateApiContainer = document.createElement("div");
            slateApiContainer.className = "slate-api";
            slateApiContainer.id = "slate-" + slate.slateName;

            var slateDropdownButton = document.createElement("div");
            slateDropdownButton.className = "slate-dropdown-button";

            var slateName = document.createElement("div");
            slateName.className = "slate-name";

            var slateProfile = document.createElement("div");
            slateProfile.className = "slate-profile a";
            slateProfile.setAttribute(
              "style",
              "background-image: url('" + slate.photo + "') !important;"
            );

            var slateNameText = document.createElement("div");
            slateNameText.innerHTML = slate.slateName;

            slateName.appendChild(slateProfile);
            slateName.appendChild(slateNameText);
            slateDropdownButton.appendChild(slateName);
            slateApiContainer.appendChild(slateDropdownButton);
            document
              .getElementById("list-slates")
              .appendChild(slateApiContainer);

            slate.slates.forEach((item, i) => {
              let slateContainer = document.createElement("div");
              slateContainer.className = "slate-item";
              //slateContainer.setAttribute("data-slateId", slate.id);
              slateContainer.onclick = async () => {
                let slateArray = uploadQueue.map((fileData) => {
                  let data = {
                    api: slate.key,
                    slate: item,
                    file: fileData,
                  };
                  this.uploadQueueSlates.push({ data });
                  return data;
                });

                //this.uploadQueueSlates.push({ slateData });
                //console.log("Slate added to queue: ", this.uploadQueueSlates);
                slateContainer.classList.toggle("slate-selected");
              };

              let slateIcon = document.createElement("div");
              slateIcon.innerHTML =
                '<svg id="not-selected" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
              let slateName = document.createElement("div");
              slateName.innerHTML = item.name;
              slateContainer.appendChild(slateIcon);
              slateContainer.appendChild(slateName);
              document
                .getElementById("slate-" + slate.slateName)
                .appendChild(slateContainer);
            });
          });

          return true;
        })
        .fail(function () {
          return false;
        });
      return true;
    } catch (error) {
      console.error(error);
    }
  };

  SlateApp.prototype.getSlates = async (props) => {
    const response = await fetch("https://slate.host/api/v1/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // NOTE: your API key
        Authorization: "Basic " + props,
      },
      body: JSON.stringify({
        data: {
          // NOTE: optional, if you want your private slates too.
          private: true,
        },
      }),
    });
    const data = await response.json();
    //console.log("Response data: ", data);

    return data;
  };

  SlateApp.prototype.getApiKeys = async () => {
    async function getKey(key) {
      const response = await fetch("https://slate.host/api/v1/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // NOTE: your API key
          Authorization: "Basic " + key,
        },
        body: JSON.stringify({
          data: {
            // NOTE: optional, if you want your private slates too.
            private: true,
          },
        }),
      });
      const data = await response.json();
      let slates = [];
      for (let item of data.slates) {
        slates.push({ id: item.id, name: item.slatename });
      }
      return slates;
    }

    var storage = new Promise(function (resolve, reject) {
      chrome.storage.local.get(["apis"], function (result) {
        resolve(result);
      });
    });

    try {
      const getAPIKeys = await storage;
      let keys = Object.values(getAPIKeys);
      let all = [];

      for (let item of keys) {
        let fr = await getKey(item.key);
        all.push({
          key: item.key,
          slateName: item.data.name,
          slates: fr,
          photo: item.data.photo,
        });
      }

      return all;
    } catch (e) {
      return "Can not retrieve API Key";
    }
  };

  return SlateApp;
})();

//
//
//App event listeners
var app = new SlateApp();
chrome.runtime.onMessage.addListener(async function (request, callback) {
  if (request.message == "openSlateApp") {
    //required order
    await app.init();
    await app.getPageData();
    let allPageFiles = await app.getPageFiles();
    let apiKeys = await app.getApiKeys();
    //let slates = "await app.getSlates(apiKeys);";
    await app.listFiles(allPageFiles, apiKeys);
    //Add below:
  }
});
