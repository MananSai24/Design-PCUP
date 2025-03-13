function initAnalytics() {
    // Create analytics chart on page load
    createAnalyticsChart();
    
    // Load analytics data
    loadAnalyticsData();
}

function createAnalyticsChart() {
    const ctx = document.getElementById('analytics-chart').getContext('2d');
    
    window.analyticsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Focus Time (minutes)',
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#6d4aff',
                borderWidth: 0,
                borderRadius: 4,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        borderDash: [5, 5]
                    },
                    ticks: {
                        stepSize: 30
                    },
                    title: {
                        display: true,
                        text: 'Minutes'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#333',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} minutes`;
                        }
                    }
                }
            }
        }
    });
}

function loadAnalyticsData() {
    fetch('/api/analytics')
    .then(response => response.json())
    .then(data => {
        // Update chart with data
        updateAnalyticsChart(data);
    })
    .catch(error => {
        console.error('Error fetching analytics data:', error);
    });
}

function updateAnalyticsChart(data) {
    // Extract data in the correct order
    const chartData = [
        data.Mon || 0,
        data.Tue || 0,
        data.Wed || 0,
        data.Thu || 0,
        data.Fri || 0,
        data.Sat || 0,
        data.Sun || 0
    ];
    
    // Update chart data
    window.analyticsChart.data.datasets[0].data = chartData;
    window.analyticsChart.update();
}
