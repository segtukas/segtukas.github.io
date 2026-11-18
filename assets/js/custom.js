/**
 * Page-specific laboratory JavaScript.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".rating-slider").forEach(function (slider) {
      var output = document.getElementById(slider.id + "-value");

      if (!output) {
        return;
      }

      var updateRating = function () {
        output.value = slider.value;
        output.textContent = slider.value;
      };

      slider.addEventListener("input", updateRating);
      updateRating();
    });

    var contactForm = document.querySelector(".contact-lab-form");
    var formResult = document.getElementById("form-result");
    var submitButton = document.getElementById("submit-contact");
    var validationSummary = document.createElement("div");
    validationSummary.id = "form-validation-summary";
    validationSummary.className = "form-validation-summary";
    validationSummary.setAttribute("role", "alert");
    validationSummary.setAttribute("aria-live", "polite");
    submitButton.parentNode.insertBefore(validationSummary, submitButton);

    if (!contactForm || !formResult || !submitButton) {
      return;
    }

    var hasSubmitted = false;

    function getFieldError(field) {
      var value = field.value.trim();

      if (field.type === "range") {
        var rating = Number(value);
        if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
          return "Įvertinimas turi būti nuo 1 iki 10.";
        }
        return "";
      }

      if (field.required && value === "") {
        return "Šis laukelis privalomas.";
      }

      if (field.id === "name" || field.id === "surname") {
        if (!/^\p{L}+$/u.test(value)) {
          return "Naudokite tik raides.";
        }
      }

      if (field.id === "email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(value)) {
          return "Įveskite teisingą el. pašto adresą.";
        }
      }

      if (field.id === "phone") {
        if (!/^\+370 [0-9]{3} [0-9]{5}$/.test(value)) {
          if (!/^\+?[0-9 ]*$/.test(value)) {
          return "Telefono numeryje naudojami neleistini simboliai.";
          }
          return "Įveskite telefono numerį formatu +370 6xx xxxxx.";
        }
        if (!/^\+370 6[0-9]{2} [0-9]{5}$/.test(value)) {
          return "Lietuvos mobiliojo telefono numeris turi prasidėti +370 6.";
        }
      }

      return "";
    }

    function validateField(field, showError) {
      var error = getFieldError(field);
      var wrapper = field.closest(".col-md-6, .col-12");
      var feedback = wrapper ? wrapper.querySelector(".field-feedback") : null;

      if (showError && error) {
        field.classList.add("is-invalid");
      } else {
        field.classList.remove("is-invalid");
      }

      if (feedback) {
        feedback.textContent = showError ? error : "";
      }

      return error === "";
    }

    function ensureFeedback(field) {
      var wrapper = field.closest(".col-md-6, .col-12");
      if (!wrapper || field.type === "range") {
        return;
      }

      if (!wrapper.querySelector(".field-feedback")) {
        var feedback = document.createElement("div");
        feedback.className = "field-feedback";
        feedback.setAttribute("aria-live", "polite");
        wrapper.appendChild(feedback);
      }
    }

    function updateSubmitButton(showErrors) {
      var fields = Array.prototype.slice.call(
        contactForm.querySelectorAll("input")
      );
      var invalidFields = fields.filter(function (field) {
        return !validateField(field, showErrors);
      });

      submitButton.disabled = false;

      if (showErrors && invalidFields.length > 0) {
        validationSummary.textContent =
          "Pataisykite pažymėtus laukus. Klaidingų laukų: " + invalidFields.length + ".";
      } else {
        validationSummary.textContent = "";
      }

      return invalidFields.length === 0;
    }

    var phoneField = contactForm.querySelector("#phone");

    if (phoneField) {
      phoneField.addEventListener("input", function () {
        var digits = phoneField.value.replace(/\D/g, "");

        if (digits.startsWith("370")) {
          digits = digits.slice(3);
        } else if (digits.startsWith("8") && digits.length === 9) {
          digits = digits.slice(1);
        }

        digits = digits.slice(0, 8);

        if (digits.length === 0) {
          phoneField.value = "";
        } else {
          phoneField.value = "+370 " + digits.slice(0, 3) +
            (digits.length > 3 ? " " + digits.slice(3) : "");
        }
      });
    }

    var resetButton = document.getElementById("reset-contact");

    function clearValidationState() {
      hasSubmitted = false;
      contactForm.querySelectorAll(".is-invalid").forEach(function (field) {
        field.classList.remove("is-invalid");
      });
      contactForm.querySelectorAll(".field-feedback").forEach(function (feedback) {
        feedback.textContent = "";
      });
      validationSummary.textContent = "";
      formResult.innerHTML = "";
    }

    function resetRatings() {
      document.querySelectorAll(".rating-slider").forEach(function (slider) {
        slider.value = "5";
        var output = document.getElementById(slider.id + "-value");
        if (output) {
          output.value = "5";
          output.textContent = "5";
        }
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        window.setTimeout(function () {
          clearValidationState();
          resetRatings();
          updateSubmitButton(false);
        }, 0);
      });
    }

    contactForm.querySelectorAll("input").forEach(function (field) {
      ensureFeedback(field);
      field.addEventListener("input", function () {
        if (hasSubmitted) {
          validateField(field, true);
          updateSubmitButton(true);
        }
      });
      field.addEventListener("blur", function () {
        // Klaidos rodomos tik bandant pateikti formą.
      });
    });

    updateSubmitButton(false);

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      hasSubmitted = true;

      if (!updateSubmitButton(true)) {
        var firstInvalid = contactForm.querySelector(".is-invalid");
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      var formData = new FormData(contactForm);
      var formObject = {
        vardas: formData.get("name"),
        pavarde: formData.get("surname"),
        elPastas: formData.get("email"),
        telefonoNumeris: formData.get("phone"),
        adresas: formData.get("address"),
        dizainoIvertinimas: formData.get("rating1"),
        patogumoIvertinimas: formData.get("rating2"),
        informatyvumoIvertinimas: formData.get("rating3")
      };

      console.log("Kontakto formos duomenys:", formObject);

      var ratingAverage =
        (Number(formObject.dizainoIvertinimas) +
          Number(formObject.patogumoIvertinimas) +
          Number(formObject.informatyvumoIvertinimas)) / 3;
      var formattedAverage = Number.isInteger(ratingAverage)
        ? String(ratingAverage)
        : ratingAverage.toFixed(2);

      console.log(
        "Įvertinimai:",
        formObject.dizainoIvertinimas,
        formObject.patogumoIvertinimas,
        formObject.informatyvumoIvertinimas,
        "Vidurkis:",
        formattedAverage
      );

      formResult.innerHTML =
        "<strong>Vardas:</strong> " + escapeHtml(formObject.vardas) + "<br>" +
        "<strong>Pavardė:</strong> " + escapeHtml(formObject.pavarde) + "<br>" +
        "<strong>El. paštas:</strong> " + escapeHtml(formObject.elPastas) + "<br>" +
        "<strong>Tel. Numeris:</strong> " + escapeHtml(formObject.telefonoNumeris) + "<br>" +
        "<strong>Adresas:</strong> " + escapeHtml(formObject.adresas) + "<br>" +
        "<strong>" + escapeHtml(formObject.vardas) + " " + escapeHtml(formObject.pavarde) +
        ":</strong> vidurkis " + formattedAverage;

      contactForm.reset();
      resetRatings();
      clearValidationState();
      updateSubmitButton(false);
    });

    function escapeHtml(value) {
      var element = document.createElement("div");
      element.textContent = value == null ? "" : value;
      return element.innerHTML;
    }
  });
})();
