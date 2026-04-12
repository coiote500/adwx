export function init3DViz() {
    const ctx = document.getElementById('earningsChart');
    if (!ctx) return;

    // Custom Plugin for background color
    const chartAreaBorder = {
        id: 'chartAreaBorder',
        beforeDraw(chart, args, options) {
            const {ctx, chartArea: {left, top, width, height}} = chart;
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            ctx.strokeRect(left, top, width, height);
            ctx.restore();
        }
    };

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

    const data = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'],
        datasets: [{
            label: 'Faturamento Acumulado (R$)',
            data: [12500, 28400, 45200, 72100, 98500, 142000, 215000, 320000, 480000, 650000],
            borderColor: '#8B5CF6',
            backgroundColor: gradient,
            borderWidth: 4,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#8B5CF6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 8,
            shadowColor: 'rgba(139, 92, 246, 0.5)',
            shadowBlur: 10
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 10, 10, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#A3A3A3',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderWidth: 1,
                    padding: 15,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#A3A3A3',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return 'R$ ' + value / 1000 + 'k';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#A3A3A3',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animations: {
                tension: {
                    duration: 2000,
                    easing: 'linear',
                    from: 1,
                    to: 0.4,
                    loop: false
                }
            }
        },
        plugins: [chartAreaBorder]
    };

    new Chart(ctx, config);
}
