const API_USER = "http://localhost:8080/api/users";

// Khởi tạo Pie Chart
let pieChart;

const initializePieChart = (data) => {
    const ctx = document.getElementById("pieChart").getContext("2d");

    const chartData = {
        labels: ["Total Tickets", "User", "Total Revenue"],
        datasets: [
            {
                label: "Dashboard Data",
                data: data, // Giá trị từ API
                backgroundColor: [
                    "#ff9800", // Màu phần Total Tickets
                    "#4caf50", // Màu phần User Growth
                    "#f44336", // Màu phần Total Revenue
                ],
                hoverOffset: 4,
            },
        ],
    };

    const config = {
        type: "pie",
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top", // Vị trí chú thích
                },
                tooltip: {
                    enabled: true, // Bật tooltip khi hover
                },
            },
        },
    };

    // Khởi tạo Pie Chart
    pieChart = new Chart(ctx, config);
};

fetch(API_USER)
    .then((res) => res.json())
    .then((data) => {
        // Cập nhật số lượng Total Users
        // Giả sử bạn có các giá trị khác từ API cho Pie Chart
        const totalTickets = data.totalTickets || 100; // Tổng số vé (giả định nếu chưa có API thực tế)
        const totalUsers = data.length || 300;
        const totalRevenue = data.totalRevenue || 300; // Tổng doanh thu

        const doc_totalUser = document.getElementById("value-total-users");
        const doc_totalRevenue = document.getElementById("value-total-revenue")
        const doc_totalTickets = document.getElementById("value-total-tickets")
        
        doc_totalUser.innerHTML = totalUsers;
        doc_totalRevenue.innerHTML = totalRevenue;
        doc_totalTickets.innerHTML = totalTickets;


        initializePieChart([totalTickets, totalUsers, totalRevenue]);
    })
    .catch((error) => {
        console.error("Error fetching data:", error);

        const totalUser = document.getElementById("value-total-users");
        totalUser.innerHTML = "Error";

        // Hiển thị Pie Chart với dữ liệu mặc định khi gặp lỗi
        initializePieChart([0, 0, 0]);
    });
