(function () {
  "use strict";

  const API_UPLOAD_ENDPOINT = "<your upload endpoint>"
  const API_RESULTS_ENDPOINT = "<your results endpoint>"

  var ErrorTimeoutId = 0;

  function showError(message) {
    if (ErrorTimeoutId > 0) {
      clearTimeout(ErrorTimeoutId);
    }

    $("#error-content").text(message);
    $("#error-box").removeClass("hidden");

    ErrorTimeoutId = setTimeout(function () {
      $("#error-box").addClass("hidden");

      ErrorTimeoutId = 0;
    }, 5000);
  }

  document.getElementById("detect").onclick = function (event) {
    event.preventDefault();

    var reader = new FileReader();
    var file = $("#image")[0].files[0];

    if (!file) {
      showError("You have not selected any file.");
      return;
    }

    $("#detect").prop("value", "Pending").attr("disabled", "disabled");

    $.ajax({
      url: API_UPLOAD_ENDPOINT,
      type: "POST",
      contentType: "application/json; charset=utf-8",

      data: JSON.stringify({
        name: file.name,
        type: file.type
      }),

      success: function (response) {
        console.log("Upload result: ", response);

        $.ajax({
          url: response.uploadURL,
          type: "PUT",
          contentType: file.type,
          data: file,
          processData: false,

          success: function (response) {
            $("#detect").prop("value", "Submit").removeAttr("disabled");
          },

          error: function (error) {
            console.error("Unexpected error: ", error);
            showError("Upload failed.");

            $("#detect").prop("value", "Submit").removeAttr("disabled");
          }
        });
      },

      error: function (error) {
        console.error("Unexpected error: ", error);
        showError("Upload link generation failed.");

        $("#detect").prop("value", "Submit").removeAttr("disabled");
      }
    });
  };

  document.getElementById("searchButton").onclick = function (event) {
    event.preventDefault();

    $.ajax({
      url: API_RESULTS_ENDPOINT,
      type: "GET",

      success: function (data) {
        $(".results tr").slice(1).remove();

        data.forEach(element => {
          var image = "<img height=\"200\" src=\"" + element["imageUrl"] + "\"/>";

          $(".results").append(
            "<tr>" +
              "<td>" + element["name"] + "</td>" +
              "<td>" + image + "</td>" +
              "<td>" + element["checked"] + "</td>" +
              "<td>" + element["status"] + "</td>" +
            "</tr>"
          );
        });
      },

      error: function (error) {
        console.error("Unexpected error: ", error);
        showError("Could not fetch any results from the back-end.");
      }
    });
  };

  // Handling events for nicer uploader component:

  var inputs = document.querySelectorAll(".uploader");

  Array.prototype.forEach.call(inputs, (input) => {
    var label  = input.nextElementSibling,
        labelVal = label.innerHTML;

    input.addEventListener("change", (event) => {
      console.log(event.target.value);

      var fileName = event.target.value.split("\\").pop();

      if (fileName) {
        label.querySelector("strong").innerHTML = fileName;
      } else {
        label.innerHTML = labelVal;
      }
    });
  });

} ());