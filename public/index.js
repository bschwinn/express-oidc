document.addEventListener('DOMContentLoaded', async function () {
    const maxStuff = 16;
    const lightSpeed = 200; // millis
    const brightness = 110; // 0-255 (it's a color multiplier)
    const colorResolution = 0;

    const renderStuff = () => {
        const stuffDiv = document.getElementById('squares');
        for (let i=0; i < maxStuff; i++) {
            const color = getRandomFillColor();
            const stuff = document.createElement('div');
            stuff.classList.add('square');
            const innerStuff = document.createElement('div');
            innerStuff.setAttribute('id', `square_${i}`);
            innerStuff.setAttribute('data-color', color);
            innerStuff.style.backgroundColor = color;
            innerStuff.addEventListener('click', (evt) => {
                logit(evt.target);
            });
            stuff.appendChild(innerStuff);
            stuffDiv.appendChild(stuff);
        }
    }

    const startLightShow = () => {
        window.setInterval(() => {
            const squareIdx = Math.floor(Math.random() * (maxStuff-1));
            const square = document.getElementById(`square_${squareIdx}`);
            const color = getRandomFillColor();
            square.setAttribute('data-color', color);
            square.style.backgroundColor = color;
        }, lightSpeed);
    }

    const logit = async (thing) => {
        const bod = { id: thing.id, color: thing.getAttribute('data-color') };
        fetch('/track', {method: 'PUT', body: JSON.stringify(bod), headers: {'Content-Type': 'application/json'}});
    }

    const getRandomFillColor = (uuid, name) => {
        return `#${randomColorChannel()}${randomColorChannel()}${randomColorChannel()}`;
    }

    // const quant = 17; // 4096 colors
    const quant = 51; // 256 colors
    const randomColorChannel = () => {
        const r = 255-brightness;
        let n = 0|((Math.random() * r) + brightness);
        n = ((n + quant / 2) / quant >> 0) * quant;
        const s = n.toString(16);
        return (s.length === 1) ? '0'+s : s;
    }

    renderStuff();
    startLightShow()

    // NOTHING TO SEE HERE, NOPE, NOTHIN AT ALL
    window.clickFarm = (clicks) => {
        let numclicks = 0;
        const runner = window.setInterval(() => {
            const squareId = `square_${Math.floor(Math.random() * (maxStuff-1))}`;
            const elem = document.getElementById(squareId);
            logit(elem);
            if (numclicks>=clicks) {
                clearInterval(runner);
                console.log('done');
                return;
            }
            numclicks++;
        }, 100);
    }

});
