/**
 * Page-specific laboratory JavaScript.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var competencies = [
      { name: "PCB plokščių projektavimas", status: "Planuojama", xp: 30 },
      { name: "Mikrovaldiklių programavimas", status: "Planuojama", xp: 40 },
      { name: "FPGA plokščių projektavimas", status: "Planuojama", xp: 25 },
      { name: "Jutiklių schemos", status: "Planuojama", xp: 25 },
      { name: "Analoginių ir skaitmeninių grandinių analizė", status: "Mokomasi", xp: 50 },
      { name: "C / C++ įterptinėms sistemoms", status: "Mokomasi", xp: 55 },
      { name: "Matavimai osciloskopu ir multimetru", status: "Mokomasi", xp: 45 },
      { name: "Elektroninių schemų skaitymas", status: "Atlikta", xp: 70 },
      { name: "Litavimas ir prototipų surinkimas", status: "Atlikta", xp: 65 },
      { name: "MATLAB signalų analizė", status: "Atlikta", xp: 60 }
    ];

    var statusColumns = {
      "Planuojama": document.querySelector(".plan-column"),
      "Mokomasi": document.querySelector(".learn-column"),
      "Atlikta": document.querySelector(".done-column")
    };
    var statusClasses = {
      "Planuojama": "skill-card-plan",
      "Mokomasi": "skill-card-learn",
      "Atlikta": "skill-card-done"
    };
    var statusLabels = ["Planuojama", "Mokomasi", "Atlikta"];
    var storageKey = "competenceStatusByName";

    function loadCompetenceStatuses() {
      try {
        var savedStatuses = JSON.parse(localStorage.getItem(storageKey));
        if (!savedStatuses) return;

        competencies.forEach(function (item) {
          if (statusLabels.indexOf(savedStatuses[item.name]) !== -1) {
            item.status = savedStatuses[item.name];
          }
        });
      } catch (error) {
        console.warn("Nepavyko nuskaityti įgūdžių būsenų iš Local Storage.", error);
      }
    }

    function saveCompetenceStatuses() {
      var statusesByName = {};
      competencies.forEach(function (item) {
        statusesByName[item.name] = item.status;
      });

      try {
        localStorage.setItem(storageKey, JSON.stringify(statusesByName));
      } catch (error) {
        console.warn("Nepavyko išsaugoti įgūdžių būsenų Local Storage.", error);
      }
    }

    loadCompetenceStatuses();

    function setText(id, value) {
      var element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    }

    function renderCompetencies() {
      Object.keys(statusColumns).forEach(function (status) {
        var column = statusColumns[status];
        if (!column) return;

        column.querySelectorAll(".skill-card").forEach(function (card) {
          card.remove();
        });

        competencies
          .filter(function (item) { return item.status === status; })
          .sort(function (a, b) { return b.xp - a.xp; })
          .forEach(function (item) {
            var card = document.createElement("article");
            card.className = "skill-card " + statusClasses[status];

            var name = document.createElement("h4");
            name.className = "skill-name";
            name.textContent = item.name;

            var statusLabel = document.createElement("label");
            statusLabel.className = "skill-status-control";
            statusLabel.appendChild(document.createTextNode("Būsena: "));

            var select = document.createElement("select");
            select.className = "skill-status-select";
            select.setAttribute("aria-label", item.name + " būsena");
            statusLabels.forEach(function (label) {
              var option = document.createElement("option");
              option.value = label;
              option.textContent = label;
              option.selected = item.status === label;
              select.appendChild(option);
            });
            select.addEventListener("change", function () {
              item.status = select.value;
              saveCompetenceStatuses();
              renderCompetencies();
              updateDashboard();
            });
            statusLabel.appendChild(select);

            var xp = document.createElement("span");
            xp.className = "skill-xp";
            xp.appendChild(document.createTextNode("XP: "));
            var xpValue = document.createElement("strong");
            xpValue.textContent = item.xp;
            xp.appendChild(xpValue);

            card.appendChild(name);
            card.appendChild(statusLabel);
            card.appendChild(xp);
            column.appendChild(card);
          });
      });
    }

    function calculateLevel(earnedXp) {
      if (earnedXp >= 300) {
        return { level: 4, rank: "Profesionalas", levelStart: 300, levelSize: 150 };
      }
      if (earnedXp >= 150) {
        return { level: 3, rank: "Specialistas", levelStart: 150, levelSize: 150 };
      }
      if (earnedXp >= 50) {
        return { level: 2, rank: "Praktikantas", levelStart: 50, levelSize: 100 };
      }
      return { level: 1, rank: "Pradedantysis", levelStart: 0, levelSize: 50 };
    }

    function calculateCompletedPercent(completedCount, totalCount) {
      return totalCount === 0 ? 0 : Math.round(completedCount / totalCount * 100);
    }

    function updateDashboard() {
      var totalXp = competencies.reduce(function (sum, item) { return sum + item.xp; }, 0);
      var earnedXp = competencies
        .filter(function (item) { return item.status === "Atlikta"; })
        .reduce(function (sum, item) { return sum + item.xp; }, 0);
      var completedCount = competencies.filter(function (item) {
        return item.status === "Atlikta";
      }).length;
      var completedPercent = calculateCompletedPercent(completedCount, competencies.length);
      var levelInfo = calculateLevel(earnedXp);
      var level = levelInfo.level;
      var rank = levelInfo.rank;
      var levelStart = levelInfo.levelStart;
      var levelSize = levelInfo.levelSize;

      var xpInLevel = earnedXp - levelStart;
      var progress = level >= 4 ? 100 : Math.min(100, Math.round(xpInLevel / levelSize * 100));
      var nextLevelXp = level >= 4 ? null : levelStart + levelSize;

      setText("earned-xp", earnedXp);
      setText("dashboard-level", level);
      setText("dashboard-rank", rank);
      setText("skill-count", competencies.length);
      setText("completed-count", completedCount);
      setText("completed-percent", completedPercent + "%");
      setText("level-progress-percent", progress + "%");
      setText(
        "level-progress-label",
        nextLevelXp === null ? "Maksimalus pasiektas lygis" : "Progresas iki " + (level + 1) + " lygio"
      );
      var progressFill = document.getElementById("level-progress-fill");
      if (progressFill) {
        progressFill.style.width = progress + "%";
        progressFill.parentElement.setAttribute("aria-valuenow", progress);
        progressFill.parentElement.setAttribute(
          "aria-valuetext",
          nextLevelXp === null
            ? "Pasiektas aukščiausias lygis"
            : xpInLevel + " iš " + levelSize + " XP šiame lygyje"
        );
      }
      setText(
        "level-progress-text",
        nextLevelXp === null
          ? "Pasiektas aukščiausias lygis"
          : xpInLevel + " / " + levelSize + " XP šiame lygyje · trūksta " + (nextLevelXp - earnedXp) + " XP"
      );

      var dashboardLevel = document.querySelector(".dashboard-level");
      dashboardLevel && dashboardLevel.setAttribute(
        "title",
        "Visų " + competencies.length + " įgūdžių bendra XP suma: " + totalXp
      );
    }

    renderCompetencies();
    updateDashboard();

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

    if (!contactForm || !formResult || !submitButton) {
      return;
    }

    var validationSummary = document.createElement("div");
    validationSummary.id = "form-validation-summary";
    validationSummary.className = "form-validation-summary";
    validationSummary.setAttribute("role", "alert");
    validationSummary.setAttribute("aria-live", "polite");
    submitButton.parentNode.insertBefore(validationSummary, submitButton);

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
