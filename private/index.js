document.addEventListener('DOMContentLoaded', async function () {

    const refreshInterval = 600;
    let autoRefresh = true;

    const loadData = async () => {
        try {
            const resp = await fetch('/api');
            if (resp.ok) {
                data = await resp.json();
                return data;
            }
        } catch(e) {
            console.error(e);
            document.getElementById('err').innerHTML = 'error getting tracking data';
        }
        return null;    
    }

    const renderData = async (results) => {
        const res = document.getElementById('results');
        if (results.length > 0) {
            res.innerHTML = '';
            const width = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--real-width'));
            const filtered = results.sort((a, b) => {
                return b.value - a.value;
            });

            const x = d3.scaleLinear().domain([0, d3.max(filtered, d => d.value)]).range([0, width]);
    
            const div = d3.create('div');
            div.selectAll("div").data(filtered).join('div')
              .attr("class", "bar")
              .style("background", d => d.color)
              .style("width", d => `${x(d.value)}px`)
              .append('div')
              .attr("class", "barval")
              .text(d => d.value)
            
            res.appendChild(div.node());
        } else {
            document.getElementById('err').innerHTML = 'no datas?!?! go pick some colors';
        }
    }

    const refreshData = async () => {
        let data = await loadData();
        if (data) {
            renderData(data.results);
        }
    }

    let refresher = window.setInterval(refreshData, refreshInterval);
    const title = document.querySelector('body h2');
    title.setAttribute('title', 'auto mode');
    title.addEventListener('dblclick', () => {
        if (autoRefresh) {
            console.log('entering manual mode');
            window.clearInterval(refresher);
            title.setAttribute('title', 'manual mode');
        } else {
            console.log('entering auto mode');
            refresher = window.setInterval(refreshData, refreshInterval);
            title.setAttribute('title', 'auto mode');
        }
        autoRefresh = !autoRefresh;
    });

    refreshData();
});
