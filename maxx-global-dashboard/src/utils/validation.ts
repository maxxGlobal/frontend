// src/utils/validation.ts

export function setupTurkishValidation(containerSelector = "body") {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const requiredInputs = container.querySelectorAll(
    "input[required], select[required], textarea[required]"
  );

  requiredInputs.forEach((input: any) => {
    // Invalid event listener
    input.addEventListener("invalid", function (e: any) {
      const field = e.target;
      const fieldName = getTurkishFieldName(field);

      if (field.validity.valueMissing) {
        field.setCustomValidity(`${fieldName} boş bırakılamaz.`);
      } else if (field.validity.typeMismatch) {
        if (field.type === "email") {
          field.setCustomValidity("Geçerli bir e-posta adresi girin.");
        } else if (field.type === "number") {
          field.setCustomValidity("Lütfen geçerli bir sayı girin.");
        } else if (field.type === "url") {
          field.setCustomValidity("Geçerli bir web adresi girin.");
        } else if (field.type === "tel") {
          field.setCustomValidity("Geçerli bir telefon numarası girin.");
        }
      } else if (field.validity.patternMismatch) {
        field.setCustomValidity("Girilen format uygun değil.");
      } else if (field.validity.rangeUnderflow) {
        field.setCustomValidity(`Değer en az ${field.min} olmalıdır.`);
      } else if (field.validity.rangeOverflow) {
        field.setCustomValidity(`Değer en fazla ${field.max} olabilir.`);
      } else if (field.validity.stepMismatch) {
        field.setCustomValidity("Girilen değer geçerli bir adım değil.");
      } else if (field.validity.tooShort) {
        field.setCustomValidity(
          `En az ${field.minLength} karakter girmelisiniz.`
        );
      } else if (field.validity.tooLong) {
        field.setCustomValidity(
          `En fazla ${field.maxLength} karakter girebilirsiniz.`
        );
      }
    });

    // Input event listener - validity'yi temizle
    input.addEventListener("input", function (e: any) {
      e.target.setCustomValidity("");
    });

    // Change event listener - select için
    input.addEventListener("change", function (e: any) {
      e.target.setCustomValidity("");
    });
  });
}

function getTurkishFieldName(field: HTMLElement): string {
  // Önce label'a bakı
  const label = document.querySelector(`label[for="${field.id}"]`);
  if (label) {
    return label.textContent?.replace(/\s*\*\s*/, "").trim() || "Bu alan";
  }

  // Placeholder'a bak
  const placeholder = (field as HTMLInputElement).placeholder;
  if (placeholder) {
    return placeholder.replace(/\s*\*\s*/, "").trim();
  }

  // Name attribute'tan çevir
  const fieldName = (field as HTMLInputElement).name;
  const fieldMap: Record<string, string> = {
    name: "Ürün Adı",
    code: "Ürün Kodu",
    email: "E-posta",
    password: "Şifre",
    phone: "Telefon",
    address: "Adres",
    categoryId: "Kategori",
    stockQuantity: "Stok Adedi",
    unit: "Birim",
    lotNumber: "Lot Numarası",
    material: "Malzeme",
    size: "Boyut",
    diameter: "Çap",
    weightGrams: "Ağırlık",
    description: "Açıklama",
  };

  return fieldMap[fieldName] || "Bu alan";
}

// Form submit öncesi validation
export function validateFormInTurkish(form: HTMLFormElement): boolean {
  const inputs = form.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >("input, select, textarea");
  let isValid = true;
  let firstInvalid:
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement
    | null = null;

  inputs.forEach((input: any) => {
    if (!input.checkValidity()) {
      isValid = false;
      if (!firstInvalid) {
        firstInvalid = input;
      }
    }
  });

  // İlk invalid alana odaklan
  if (firstInvalid) {
    (firstInvalid as HTMLElement).focus();
    (firstInvalid as HTMLElement).scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return isValid;
}
