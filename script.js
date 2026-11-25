const modelTitles = {
  model1: 'البيع القطعي',
  model2: 'البيع القطعي مع تصحيح الأوصاف',
  model3: 'الانتقال',
  model4: 'الانتقال والبيع',
  model5: 'الانتقال والبيع مع تصحيح الأوصاف'
};

function getModelField(section, fieldId) {
  const suffix = { model1: '', model2: '2', model3: '3', model4: '4', model5: '5' }[section.id];
  return section.querySelector(`#${fieldId}${suffix}`);
}

function createModelClone(modelId) {
  const original = document.getElementById('model1');
  const model = original.cloneNode(true);
  const suffix = { model2: '2', model3: '3', model4: '4', model5: '5' }[modelId];
  model.id = modelId;
  model.querySelectorAll('[id]').forEach(element => {
    element.id += suffix;
  });
  model.querySelector('.model-title').textContent = modelTitles[modelId];
  return model;
}

function createAdditionalModels() {
  const original = document.getElementById('model1');
  const correctionModel = createModelClone('model2');
  getModelField(correctionModel, 'val_req').value = '12';
  const transitionModel = createModelClone('model3');
  transitionModel.dataset.modelType = 'transition';
  const transferAndSaleModel = createModelClone('model4');
  transferAndSaleModel.dataset.modelType = 'transition';
  const correctedTransferAndSaleModel = createModelClone('model5');
  correctedTransferAndSaleModel.dataset.modelType = 'transition';
  original.after(correctionModel, transitionModel, transferAndSaleModel, correctedTransferAndSaleModel);
}

function showModel(modelId) {
  document.getElementById('mainMenu').style.display = 'none';
  document.getElementById('underConstruction').style.display = 'none';
  const sections = document.querySelectorAll('.model-section');
  sections.forEach(sec => sec.classList.remove('active'));
  document.getElementById(modelId).classList.add('active');
  document.title = modelTitles[modelId];
}

function showUnderConstruction() {
  document.getElementById('mainMenu').style.display = 'none';
  const sections = document.querySelectorAll('.model-section');
  sections.forEach(sec => sec.classList.remove('active'));
  document.getElementById('underConstruction').style.display = 'flex';
  document.title = 'قيد الإنشاء';
}

function goHome() {
  const sections = document.querySelectorAll('.model-section');
  sections.forEach(sec => sec.classList.remove('active'));
  document.getElementById('underConstruction').style.display = 'none';
  document.getElementById('mainMenu').style.display = 'block';
  document.title = 'النماذج العقارية';
}

document.addEventListener('DOMContentLoaded', () => {
  createAdditionalModels();
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.lang = 'en';
    input.dir = 'ltr';
  });
  document.querySelectorAll('.fees-table input').forEach(input => {
    input.lang = 'en';
    input.dir = 'ltr';
  });
  document.querySelectorAll('.model-section input[type="date"]').forEach(input => {
    input.value = today;
  });
  document.querySelectorAll('.death-year').forEach(input => {
    input.max = String(new Date().getFullYear());
  });

  document.querySelectorAll('[data-model]').forEach(button => {
    button.addEventListener('click', () => showModel(button.dataset.model));
  });
  document.querySelectorAll('[data-under-construction]').forEach(button => {
    button.addEventListener('click', showUnderConstruction);
  });
  document.querySelectorAll('[data-go-home]').forEach(button => {
    button.addEventListener('click', goHome);
  });

  document.querySelectorAll('input[type="number"], input[inputmode="decimal"]').forEach(input => {
    input.addEventListener('input', () => {
      input.value = input.value
        .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632))
        .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776));
    });
  });

  document.querySelectorAll('.model-section').forEach(section => {
    getModelField(section, 'calculateBtn').addEventListener('click', () => calculate(section));
    getModelField(section, 'printBtn').addEventListener('click', () => window.print());
    getModelField(section, 'paperSize').addEventListener('change', () => changePaper(section));
    ['val_transfer', 'val_req', 'val_bonds'].forEach(id => {
      getModelField(section, id).addEventListener('input', () => calcTotals(section));
    });
  });
});

window.addEventListener('afterprint', () => window.location.reload());

function tafqeet(number) {
  if (number === 0) return "صفر ليرة سورية";
  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مئة", "مئتان", "ثلاثمئة", "أربعمئة", "خمسمئة", "ستمئة", "سبعمئة", "ثمانمئة", "تسعمئة"];

  function convertGroup(n) {
    let parts = [];
    if (n >= 100) { parts.push(hundreds[Math.floor(n / 100)]); n %= 100; }
    if (n >= 20) {
      const unit = n % 10;
      const ten = Math.floor(n / 10);
      if (unit > 0) { parts.push(ones[unit] + " و" + tens[ten]); } else { parts.push(tens[ten]); }
    } else if (n > 0) { parts.push(ones[n]); }
    return parts.join(" و");
  }

  const parts = [];
  let num = Math.floor(number);
  const millions = Math.floor(num / 1000000);
  if (millions > 0) {
    if (millions === 1) parts.push("مليون");
    else if (millions === 2) parts.push("مليونان");
    else if (millions >= 3 && millions <= 10) parts.push(convertGroup(millions) + " ملايين");
    else parts.push(convertGroup(millions) + " مليون");
    num %= 1000000;
  }

  const thousands = Math.floor(num / 1000);
  if (thousands > 0) {
    if (thousands === 1) parts.push("ألف");
    else if (thousands === 2) parts.push("ألفان");
    else if (thousands >= 3 && thousands <= 10) parts.push(convertGroup(thousands) + " آلاف");
    else parts.push(convertGroup(thousands) + " ألف");
    num %= 1000;
  }

  if (num > 0) parts.push(convertGroup(num));
  return parts.join(" و") + " ليرة سورية";
}

function calculate(section) {
  const area = parseFloat(getModelField(section, 'area').value) || 0;
  const price = parseFloat(getModelField(section, 'price').value) || 0;
  const transition = section.id === 'model3' || section.id === 'model4' || section.id === 'model5';
  let financialRate = 0.05;
  if (transition) {
    const deathYear = Number(getModelField(section, 'deathYear').value);
    if (!Number.isInteger(deathYear) || deathYear < 1 || deathYear > new Date().getFullYear()) {
      alert('يرجى إدخال سنة وفاة صحيحة لا تتجاوز السنة الحالية.');
      return;
    }
    financialRate = deathYear >= 2021 ? 0.15 : 0.15 / 3;
  }

  const r1 = area * price;
  const n1 = r1 * 0.001;
  const n2 = n1 * 0.10;
  const correction = section.id === 'model2' || section.id === 'model5';
  const saleFee = Math.ceil(n1 + n2);

  if (section.id === 'model4' || section.id === 'model5') {
    // Calculation of the exact sale form
    const saleN3 = saleFee * 0.05;
    const saleN4 = saleN3 * 0.10;
    const saleFinancialFee = Math.ceil(saleN3 + saleN4);
    const saleF1 = saleFee * 0.10;
    const saleF2 = saleFinancialFee * 0.05;
    const saleLocalAdminFee = Math.ceil(saleF1 + saleF2 + 1);

    // Calculation of the exact transfer form using the transfer financial rate
    const transferN3 = saleFee * financialRate;
    const transferN4 = transferN3 * 0.10;
    const transferFinancialFee = Math.ceil(transferN3 + transferN4);
    const transferF1 = saleFee * 0.10;
    const transferF2 = transferFinancialFee * 0.05;
    const transferLocalAdminFee = Math.ceil(transferF1 + transferF2 + 1);

    setValue(section, 'val_sale', saleFee + (correction ? 11 : 0));
    setValue(section, 'val_transfer', saleFee);
    setValue(section, 'val_req', section.id === 'model5' ? 18 : 12);
    setValue(section, 'val_financial', saleFinancialFee + (correction ? 2 : 0) + transferFinancialFee);
    setValue(section, 'val_local', saleLocalAdminFee + (correction ? 3 : 0) + transferLocalAdminFee);
    calcTotals(section);
    return;
  }

  const n3 = saleFee * financialRate;
  const n4 = n3 * 0.10;
  const financialFee = Math.ceil(n3 + n4);
  const f1 = saleFee * 0.10;
  const f2 = financialFee * 0.05;
  const localAdminFee = Math.ceil(f1 + f2 + 1);

  if (section.id === 'model3') {
    setValue(section, 'q_sale', 0);
    setValue(section, 'val_sale', 0);
    setValue(section, 'val_transfer', saleFee);
  } else {
    setValue(section, 'val_sale', saleFee + (correction ? 11 : 0));
  }
  setValue(section, 'val_financial', financialFee + (correction ? 2 : 0));
  setValue(section, 'val_local', localAdminFee + (correction ? 3 : 0));
  calcTotals(section);
}

function setValue(section, id, val) {
  getModelField(section, id).value = val;
  const qId = id.replace('val_', 'q_');
  const qField = getModelField(section, qId);
  if (qField) qField.value = 0;
}

function calcTotals(section) {
  const getVal = (id) => Math.ceil(parseFloat(getModelField(section, id).value) || 0);
  const combinedInvoices = section.id === 'model4' || section.id === 'model5';
  const sale = getVal('val_sale');
  const transfer = getVal('val_transfer');
  const req = combinedInvoices ? (section.id === 'model5' ? 18 : 12) : getVal('val_req');
  const stamps = combinedInvoices ? 32 : 16;
  const bonds = getVal('val_bonds') * (combinedInvoices ? 2 : 1);
  const contract = combinedInvoices ? 70 : 35;

  const feesTable = section.querySelector('.fees-table');
  if (feesTable) {
    feesTable.querySelectorAll('tbody tr').forEach(row => {
      const type = row.querySelector('.col-type');
      if (!type) return;
      const cells = row.querySelectorAll('td');
      if (type.textContent.trim() === 'طوابع') cells[1].textContent = stamps;
      if (type.textContent.trim() === 'ثمن محضر العقد') cells[1].textContent = contract;
    });
  }
  const totalFees = sale + transfer + req + stamps + bonds + contract;
  const financial = getVal('val_financial');
  const localAdmin = getVal('val_local');
  const grandTotal = totalFees + financial + localAdmin;

  getModelField(section, 'total_fees_ls').textContent = totalFees;
  getModelField(section, 'total_fees_q').textContent = 0;
  getModelField(section, 'grand_total_ls').textContent = grandTotal;
  getModelField(section, 'grand_total_q').textContent = 0;
  getModelField(section, 'tafqit_result').textContent = tafqeet(grandTotal);
}

function changePaper(section) {
  const size = getModelField(section, 'paperSize').value;
  let style = document.getElementById('page-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'page-style';
    document.head.appendChild(style);
  }
  style.textContent = `@page { size: ${size} portrait; margin: 10mm; }`;
}
