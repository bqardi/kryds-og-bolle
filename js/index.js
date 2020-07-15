document.addEventListener("DOMContentLoaded", event => {
    const fields = document.querySelectorAll(".field");
    const win = document.getElementById("win");
    const noWin = document.getElementById("no-win");
    const xWin = document.getElementById("x-win");
    const oWin = document.getElementById("o-win");

    const levelButton = document.querySelectorAll(".game-level");
    const levelText = document.getElementById("level-text");
    const explanation = document.getElementById("explanation");
    const statX = document.getElementById("stat-x");
    const statO = document.getElementById("stat-o");

    let playerX = true;
    let gameOver = false;
    let aiLevel = 2;
    let placementCount = 0;
    let winDisplayTimer;

    let player = {
        x: {
            ai: false,
        },
        o: {
            ai: true,
        },
    }

    const winPattern = [
        ["0", "1", "2"],
        ["3", "4", "5"],
        ["6", "7", "8"],
        ["0", "3", "6"],
        ["1", "4", "7"],
        ["2", "5", "8"],
        ["0", "4", "8"],
        ["2", "4", "6"],
    ]

    let placements = {
        0: null,
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
        7: null,
        8: null,
    }

    for (let i = 0; i < levelButton.length; i++) {
        const button = levelButton[i];
        button.addEventListener("click", function() {
            resetButtons(levelButton);
            this.classList.add("selected");
            const level = parseInt(this.dataset.level);
            setLevel(level, "AI: " + this.textContent, this.dataset.explanation);
        });
        if (i == 0) {
            button.classList.add("selected");
            setLevel(0, "AI: " + button.textContent, button.dataset.explanation);
        }
    }

    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        field.addEventListener("mouseover", function() {
            if (gameOver) {
                return;
            }
            if (!playerX && player.o.ai) {
                return;
            }
            if (this.classList.contains("placed")) {
                return;
            }
            if (playerX) {
                const x = this.querySelector(".x");
                x.classList.remove("hidden");
            } else {
                const o = this.querySelector(".o");
                o.classList.remove("hidden");
            }
        });
        field.addEventListener("mouseout", function() {
            if (gameOver) {
                return;
            }
            if (!playerX && player.o.ai) {
                return;
            }
            if (this.classList.contains("placed")) {
                return;
            }
            if (playerX) {
                const x = this.querySelector(".x");
                x.classList.add("hidden");
            } else {
                const o = this.querySelector(".o");
                o.classList.add("hidden");
            }
        });
        field.addEventListener("click", function() {
            if (gameOver) {
                return;
            }
            if (!playerX && player.o.ai) {
                return;
            }
            if (this.classList.contains("placed")) {
                return;
            }
            if (playerX) {
                this.classList.add("x");
                placements[this.id] = "x";
            } else {
                this.classList.add("o");
                placements[this.id] = "o";
            }
            this.classList.add("placed");
            placementCount++;
            if (winCheck()) {
                return;
            }
            playerX = !playerX;
            if (!playerX && player.o.ai) {
                setTimeout(() => {
                    switch (aiLevel) {
                        case 0:
                            aiStupid();
                            break;
                        case 1:
                            aiOffensive();
                            break;
                        case 2:
                            aiDefensive();
                            break;
                        case 3:
                            aiMaster();
                            break;

                        default:
                            break;
                    }
                }, 500);
            }
        });
    }

    win.addEventListener("click", function() {
        clearTimeout(winDisplayTimer);
        reset();
    });

    function setLevel(level, text, explanationText) {
        aiLevel = level;
        levelText.textContent = text;
        explanation.textContent = explanationText;
    }

    function resetButtons(btnArr) {
        for (let i = 0; i < btnArr.length; i++) {
            const btn = btnArr[i];
            btn.classList.remove("selected");
        }
    }

    function aiStupid() {
        let rndKey = randomIndex(fields.length);
        while (fields[rndKey].classList.contains("placed")) {
            rndKey = randomIndex(fields.length);
        }
        ai(rndKey, "o");
    }

    function aiDefensive() {
        let possibleField = [];
        for (let i = 0; i < winPattern.length; i++) {
            const pattern = winPattern[i];
            const fieldKey = twoCheck(pattern, "o");
            if (fieldKey) {
                possibleField.push(fieldKey);
            }
        }
        let key;
        if (possibleField.length == 0) {
            key = randomIndex(fields.length);
            while (fields[key].classList.contains("placed")) {
                key = randomIndex(fields.length);
            }
        } else {
            key = possibleField[randomIndex(possibleField.length)];
        }
        ai(key, "o");
    }

    function aiOffensive() {
        let possibleField = [];
        for (let i = 0; i < winPattern.length; i++) {
            const pattern = winPattern[i];
            const fieldKey = twoCheck(pattern, "x");
            if (fieldKey) {
                possibleField.push(fieldKey);
            }
        }
        let key;
        if (possibleField.length == 0) {
            key = randomIndex(fields.length);
            while (fields[key].classList.contains("placed")) {
                key = randomIndex(fields.length);
            }
        } else {
            key = possibleField[randomIndex(possibleField.length)];
        }
        ai(key, "o");
    }

    function aiMaster() {
        let possibleField = [];
        for (let i = 0; i < winPattern.length; i++) {
            const pattern = winPattern[i];
            const fieldKey = twoCheck(pattern, "x");
            if (fieldKey) {
                possibleField.push(fieldKey);
            }
        }
        let key;
        if (possibleField.length == 0) {
            for (let i = 0; i < winPattern.length; i++) {
                const pattern = winPattern[i];
                const fieldKey = twoCheck(pattern, "o");
                if (fieldKey) {
                    possibleField.push(fieldKey);
                }
            }
        }
        if (possibleField.length == 0) {
            key = randomIndex(fields.length);
            while (fields[key].classList.contains("placed")) {
                key = randomIndex(fields.length);
            }
        } else {
            key = possibleField[randomIndex(possibleField.length)];
        }
        ai(key, "o");
    }

    function ai(fieldKey, symbol) {
        fields[fieldKey].classList.add(symbol);
        fields[fieldKey].classList.add("placed");
        placementCount++;
        placements[fields[fieldKey].id] = symbol;
        if (winCheck()) {
            return;
        }
        playerX = !playerX;
    }

    function winCheck() {
        for (let i = 0; i < winPattern.length; i++) {
            const pattern = winPattern[i];
            let symbol = threeCheck(pattern);
            if (symbol) {
                showWinner(symbol);
                gameOver = true;
            }
        }
        if (placementCount == 9 && !gameOver) {
            showWinner();
            gameOver = true;
        }
        return gameOver;
    }

    function twoCheck(arr, symbol) {
        let id = false;
        for (let i = 0; i < arr.length; i++) {
            const field = arr[i];
            if (placements[field] == symbol) {
                return false;
            }
            if (placements[field] == null) {
                if (id) {
                    return false;
                } else {
                    id = field;
                }
            }
        }
        return id;
    }

    function threeCheck(arr) {
        let symbol = placements[arr[0]];
        if (symbol == null) {
            return false;
        }
        for (let i = 1; i < arr.length; i++) {
            const field = arr[i];
            if (placements[field] != symbol) {
                return false;
            }
        }
        return symbol;
    }

    function showWinner(winnerSymbol = null) {
        if (winnerSymbol == "x") {
            noWin.classList.add("hidden");
            xWin.classList.remove("hidden");
            oWin.classList.add("hidden");
            statX.textContent = ++statX.textContent;
        } else if (winnerSymbol == "o") {
            noWin.classList.add("hidden");
            xWin.classList.add("hidden");
            oWin.classList.remove("hidden");
            statO.textContent = ++statO.textContent;
        } else {
            noWin.classList.remove("hidden");
            xWin.classList.add("hidden");
            oWin.classList.add("hidden");
        }
        win.classList.remove("transparent");
        winDisplayTimer = setTimeout(() => {
            reset();
        }, 3000);
    }

    function reset() {
        win.classList.add("transparent");
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            field.classList.remove("placed");
            field.classList.remove("x");
            field.classList.remove("o");
            field.querySelector(".x").classList.add("hidden");
            field.querySelector(".o").classList.add("hidden");
        }
        for (let i = 0; i < Object.keys(placements).length; i++) {
            const key = Object.keys(placements)[i];
            placements[key] = null;
        }
        gameOver = false;
        playerX = true;
        placementCount = 0;
    }

    function randomIndex(length) {
        let rnd = Math.floor(Math.random() * length);
        return rnd;
    }
});