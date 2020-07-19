document.addEventListener("DOMContentLoaded", event => {
    const fields = document.querySelectorAll(".field");
    const win = document.getElementById("win");
    const levelUp = document.getElementById("level-up");
    const noWin = document.getElementById("no-win");
    const xWin = document.getElementById("x-win");
    const oWin = document.getElementById("o-win");

    const levelButtons = document.querySelectorAll(".game-level");
    const modeText = document.getElementById("mode-text");
    const levelText = document.getElementById("level-text");
    const explanation = document.getElementById("explanation");
    const statX = document.getElementById("stat-x");
    const statO = document.getElementById("stat-o");

    const mode = document.getElementById("mode");
    const nextLevel = document.getElementById("next-level");
    const nextLevelValue = document.getElementById("next-level-value");

    let playerX = true;
    let gameOver = false;
    let aiLevel = 2;
    let placementCount = 0;
    let winDisplayTimer;
    let leveledUp = false;

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

    for (let i = 0; i < levelButtons.length; i++) {
        const levelButton = levelButtons[i];
        levelButton.addEventListener("click", function() {
            resetButtons(levelButtons);
            this.classList.add("selected");
            const level = parseInt(this.dataset.level);
            setLevel(level);
        });
        if (i == 0) {
            levelButton.classList.add("selected");
            setLevel(0);
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
                            // case 1:
                            //     aiOffensive();
                            //     break;
                            // case 1:
                            //     aiDefensive();
                            //     break;
                        case 1:
                            aiClever();
                            break;
                        case 2:
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
    levelUp.addEventListener("click", function() {
        clearTimeout(winDisplayTimer);
        reset();
    });
    mode.addEventListener("click", function() {
        if (this.classList.contains("streak")) {
            levelButtonsNormal();
        } else {
            levelButtonsLevelmode();
        }
    });
    levelButtonsLevelmode();

    function setLevel(level) {
        aiLevel = level;
        levelText.textContent = levelButtons[aiLevel].ariaLabel;
        explanation.textContent = levelButtons[aiLevel].dataset.explanation;
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

    function aiClever() {
        let possibleField = [];
        for (let i = 0; i < winPattern.length; i++) {
            const pattern = winPattern[i];
            const fieldKey = twoCheck(pattern, "x");
            if (fieldKey) {
                possibleField.push(fieldKey);
            }
        }
        if (possibleField.length == 0) {
            for (let i = 0; i < winPattern.length; i++) {
                const pattern = winPattern[i];
                const fieldKey = twoCheck(pattern, "o");
                if (fieldKey) {
                    possibleField.push(fieldKey);
                }
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
        if (placementCount == 1) {
            if (placements[4] == "x") {
                possibleField = ["0", "2", "6", "8"];
            } else {
                possibleField = ["4"];
            }
        }
        if (placementCount == 3) {
            if (placements[0] == "x" && placements[4] == "o" && placements[8] == "x") {
                possibleField = ["1", "3", "5", "7"];
            }
            if (placements[2] == "x" && placements[4] == "o" && placements[6] == "x") {
                possibleField = ["1", "3", "5", "7"];
            }
            if (placements[0] == "x" && placements[4] == "o" && placements[7] == "x") {
                possibleField = ["6"];
            }
            if (placements[0] == "x" && placements[4] == "o" && placements[5] == "x") {
                possibleField = ["2"];
            }
            if (placements[2] == "x" && placements[4] == "o" && placements[7] == "x") {
                possibleField = ["8"];
            }
            if (placements[2] == "x" && placements[4] == "o" && placements[3] == "x") {
                possibleField = ["0"];
            }
            if (placements[6] == "x" && placements[4] == "o" && placements[1] == "x") {
                possibleField = ["0"];
            }
            if (placements[6] == "x" && placements[4] == "o" && placements[5] == "x") {
                possibleField = ["8"];
            }
            if (placements[8] == "x" && placements[4] == "o" && placements[1] == "x") {
                possibleField = ["2"];
            }
            if (placements[8] == "x" && placements[4] == "o" && placements[3] == "x") {
                possibleField = ["6"];
            }
            if (placements[0] == "x" && placements[4] == "x" && placements[8] == "o") {
                possibleField = ["2", "6"];
            }
            if (placements[2] == "x" && placements[4] == "x" && placements[6] == "o") {
                possibleField = ["0", "8"];
            }
            if (placements[6] == "x" && placements[4] == "x" && placements[2] == "o") {
                possibleField = ["0", "8"];
            }
            if (placements[8] == "x" && placements[4] == "x" && placements[0] == "o") {
                possibleField = ["2", "6"];
            }
            if (placements[1] == "x" && placements[4] == "o" && placements[7] == "x") {
                possibleField = ["0", "2", "6", "8"];
            }
            if (placements[3] == "x" && placements[4] == "o" && placements[5] == "x") {
                possibleField = ["0", "2", "6", "8"];
            }
            if (placements[1] == "x" && placements[4] == "o" && placements[3] == "x") {
                possibleField = ["0", "2", "6"];
            }
            if (placements[1] == "x" && placements[4] == "o" && placements[5] == "x") {
                possibleField = ["0", "2", "8"];
            }
            if (placements[7] == "x" && placements[4] == "o" && placements[3] == "x") {
                possibleField = ["0", "6", "8"];
            }
            if (placements[7] == "x" && placements[4] == "o" && placements[5] == "x") {
                possibleField = ["2", "6", "8"];
            }
        }
        for (let i = 0; i < winPattern.length; i++) {
            const pattern = winPattern[i];
            const fieldKey = twoCheck(pattern, "x");
            if (fieldKey) {
                possibleField.push(fieldKey);
            }
        }
        if (possibleField.length == 0) {
            for (let i = 0; i < winPattern.length; i++) {
                const pattern = winPattern[i];
                const fieldKey = twoCheck(pattern, "o");
                if (fieldKey) {
                    possibleField.push(fieldKey);
                }
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
        setTimeout(() => {
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
            let nextLevel = false;
            let popupTimeOut = 3000;
            for (let i = 0; i < levelButtons.length; i++) {
                const levelButton = levelButtons[i];
                if (statX.textContent == levelButton.dataset.nextLevel) {
                    nextLevel = true;
                }
            }
            if (nextLevel && !leveledUp) {
                levelUp.classList.remove("transparent");
                levelUp.classList.add("animation");
                popupTimeOut = 5000;
                leveledUp = true;
            } else {
                win.classList.remove("transparent");
                leveledUp = false;
            }
            winDisplayTimer = setTimeout(() => {
                reset();
            }, popupTimeOut);
        }, 300);
    }

    function reset() {
        win.classList.add("transparent");
        levelUp.classList.add("transparent");
        levelUp.classList.remove("animation");
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
        if (mode.classList.contains("streak")) {
            levelButtonsLevelmode();
        }
    }

    function levelButtonsLevelmode() {
        mode.classList.add("streak");
        mode.classList.remove("fri");
        modeText.textContent = "Streak";
        mode.innerHTML = `<svg viewBox="0 0 24 24"><path d="M14.58,16.59L19.17,12L14.58,7.41L16,6L22,12L16,18L14.58,16.59M8.58,16.59L13.17,12L8.58,7.41L10,6L16,12L10,18L8.58,16.59M2.58,16.59L7.17,12L2.58,7.41L4,6L10,12L4,18L2.58,16.59Z"></path></svg>`;
        nextLevel.classList.remove("hidden");
        let levelBtnSet = false;
        for (let i = 0; i < levelButtons.length; i++) {
            const levelButton = levelButtons[i];
            levelButton.classList.add("inactive");
            levelButton.disabled = true;

            if (!levelBtnSet) {
                const levelMargin = parseInt(levelButton.dataset.nextLevel);
                if (statX.textContent < levelMargin) {
                    aiLevel = i;
                    levelButton.classList.remove("inactive");
                    levelButton.classList.add("active");
                    nextLevelValue.textContent = levelMargin;
                    levelBtnSet = true;
                }
            }
        }
        setLevel(aiLevel);
    }

    function levelButtonsNormal() {
        mode.classList.remove("streak");
        mode.classList.add("fri");
        modeText.textContent = "Fri";
        mode.innerHTML = `<svg viewBox="0 0 24 24"><path d="M18 1C15.24 1 13 3.24 13 6V8H4C2.9 8 2 8.89 2 10V20C2 21.11 2.9 22 4 22H16C17.11 22 18 21.11 18 20V10C18 8.9 17.11 8 16 8H15V6C15 4.34 16.34 3 18 3C19.66 3 21 4.34 21 6V8H23V6C23 3.24 20.76 1 18 1M10 13C11.1 13 12 13.89 12 15C12 16.11 11.11 17 10 17C8.9 17 8 16.11 8 15C8 13.9 8.9 13 10 13Z"></path></svg>`;
        nextLevel.classList.add("hidden");
        for (let i = 0; i < levelButtons.length; i++) {
            const levelButton = levelButtons[i];
            levelButton.classList.remove("active");
            levelButton.classList.remove("inactive");
            levelButton.disabled = false;
        }
        resetButtons(levelButtons);
        levelButtons[aiLevel].classList.add("selected");
        setLevel(aiLevel);
    }

    function randomIndex(length) {
        let rnd = Math.floor(Math.random() * length);
        return rnd;
    }
});