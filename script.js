const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
    // İşlemi tam olarak kaydetmek için dize olarak tutalım
    expressionString: '' 
};

function updateDisplay() {
    const display = document.querySelector('.calculator-screen');
    display.value = calculator.displayValue;
}

updateDisplay();

const keys = document.querySelector('.calculator-keys');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

// --- GEÇMİŞİ TEMİZLE BUTONU ---
clearHistoryBtn.addEventListener('click', () => {
    historyList.innerHTML = '';
});

// --- GEÇMİŞE EKLEME FONKSİYONU ---
function addToHistory(expression, result) {
    const listItem = document.createElement('li');
    listItem.textContent = `${expression} = ${result}`;
    historyList.appendChild(listItem);
    
    // Otomatik olarak en alta kaydır
    historyList.scrollTop = historyList.scrollHeight;
}

// --- MOUSE TIKLAMASI ---
keys.addEventListener('click', (event) => {
    const { target } = event;
    if (!target.matches('button')) return;
    handleInput(target.value, target);
});

// --- KLAVYE DESTEĞİ ---
document.addEventListener('keydown', (event) => {
    const key = event.key;
    let buttonValue = null;
    let buttonSelector = null;

    if (key >= 0 && key <= 9) { buttonValue = key; buttonSelector = `button[value="${key}"]`; }
    if (key === '.') { buttonValue = '.'; buttonSelector = `button[value="."]`; }
    if (key === '=' || key === 'Enter') { buttonValue = '='; buttonSelector = `button[value="="]`; }
    if (key === 'Backspace') { buttonValue = 'delete'; buttonSelector = `button[value="delete"]`; }
    if (key === 'Escape') { buttonValue = 'all-clear'; buttonSelector = `button[value="all-clear"]`; }
    if (key === '+' || key === '-' || key === '*' || key === '/') { 
        buttonValue = key; 
        buttonSelector = `button[value="${key}"]`; 
    }

    if (buttonValue) {
        const button = document.querySelector(buttonSelector);
        handleInput(buttonValue, button);
    }
});

// --- ANA MANTIK ---
function handleInput(value, buttonElement) {
    if(buttonElement) {
        buttonElement.classList.add('active');
        setTimeout(() => buttonElement.classList.remove('active'), 100);
    }

    if (value === '+' || value === '-' || value === '*' || value === '/') {
        handleOperator(value);
    } else if (value === '.') {
        inputDecimal(value);
    } else if (value === 'all-clear') {
        resetCalculator();
    } else if (value === 'delete') {
        deleteDigit();
    } else if (value === '=') {
        // Eşittire basıldığında hesapla VE geçmişe ekle
        if (calculator.operator && calculator.firstOperand != null && !calculator.waitingForSecondOperand) {
            const result = calculate(calculator.firstOperand, parseFloat(calculator.displayValue), calculator.operator);
            
            // Geçmiş dizesini oluştur (Örn: 12 + 5)
            const expression = `${calculator.firstOperand} ${calculator.operator} ${calculator.displayValue}`;
            
            // Sonucu biçimlendir
            const formattedResult = `${parseFloat(result.toFixed(7))}`;

            // Geçmişe ekle
            addToHistory(expression, formattedResult);
            
            // Ekranı güncelle
            calculator.displayValue = formattedResult;
            calculator.firstOperand = result;
            calculator.operator = null;
            calculator.waitingForSecondOperand = false;
            calculator.expressionString = ''; // Sıfırla
        }
    } else if (!isNaN(value)) {
        inputDigit(value);
    }
    
    updateDisplay();
}

function inputDigit(digit) {
    const { displayValue, waitingForSecondOperand } = calculator;
    if (waitingForSecondOperand === true) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
}

function inputDecimal(dot) {
    if (calculator.waitingForSecondOperand === true) return;
    if (!calculator.displayValue.includes(dot)) {
        calculator.displayValue += dot;
    }
}

function deleteDigit() {
    const { displayValue } = calculator;
    if (displayValue.length === 1) {
        calculator.displayValue = '0';
    } else {
        calculator.displayValue = displayValue.slice(0, -1);
    }
}

function handleOperator(nextOperator) {
    const { firstOperand, displayValue, operator } = calculator;
    const inputValue = parseFloat(displayValue);

    if (operator && calculator.waitingForSecondOperand)  {
        calculator.operator = nextOperator;
        return;
    }

    if (firstOperand == null && !isNaN(inputValue)) {
        calculator.firstOperand = inputValue;
    } else if (operator) {
        // Ardışık işlemlerde de geçmişe ekle (Örn: 5 + 5 + ... dendiğinde ilk 5+5'i kaydet)
        const result = calculate(firstOperand, inputValue, operator);
        const expression = `${firstOperand} ${operator} ${inputValue}`;
        const formattedResult = `${parseFloat(result.toFixed(7))}`;
        addToHistory(expression, formattedResult);
        
        calculator.displayValue = formattedResult;
        calculator.firstOperand = result;
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
}

function calculate(firstOperand, secondOperand, operator) {
    if (operator === '+') return firstOperand + secondOperand;
    if (operator === '-') return firstOperand - secondOperand;
    if (operator === '*') return firstOperand * secondOperand;
    if (operator === '/') return firstOperand / secondOperand;
    return secondOperand;
}

function resetCalculator() {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
    calculator.expressionString = '';
}