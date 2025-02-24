export const htmlTemplate = (nonce: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Review Dashboard</title>
    <style nonce="${nonce}">
        body {
            font-family: Arial, sans-serif;
            background: #f4f7f9;
            margin: 0;
            padding: 20px;
            color: #333;
        }

        .container {
            max-width: 90%;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
            text-align: center;
            margin-bottom: 20px;
        }

        .btn-container {
            text-align: center;
            margin-bottom: 20px;
        }

        .fetch-btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
            transition: background 0.3s;
        }

        .fetch-btn:hover {
            background-color: #0056b3;
        }

        .table-container {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: center;
        }

        th {
            background: #007bff;
            color: white;
        }

        tr:nth-child(even) {
            background: #f9f9f9;
        }

        tr:hover {
            background: #f1f1f1;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>GitHub PR Review Statistics</h1>
        <div class="btn-container">
            <button class="fetch-btn" id="fetch-data">Load Review Data</button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Repository</th>
                        <th>PR Number</th>
                        <th>Comments</th>
                        <th>Files Reviewed</th>
                        <th>Tokens Used</th>
                    </tr>
                </thead>
                <tbody id="review-stats-body">
                    <!-- Data will be inserted here dynamically -->
                </tbody>
            </table>
        </div>
    </div>

    <script nonce="${nonce}">
        document.getElementById("fetch-data").addEventListener("click", function() {
            const tableBody = document.getElementById("review-stats-body");
            tableBody.innerHTML = "<tr><td colspan='6'>Loading...</td></tr>";

            fetch("/api/v1/stats")
                .then(response => response.json())
                .then(data => {
                    console.log("Data:", data);
                    tableBody.innerHTML = "";

                    if (!Object.keys(data).length) {
                        tableBody.innerHTML = "<tr><td colspan='6'>No review data available</td></tr>";
                        return;
                    }

                    Object.entries(data).forEach(([date, reviews]) => {
                        reviews.forEach((review) => {
                            const row = document.createElement("tr");

                            row.innerHTML = \`
                                <td>\${date}</td>
                                <td>\${review.repo_name}</td>
                                <td>#\${review.pr_number}</td>
                                <td>\${review.comments_generated}</td>
                                <td>\${review.files_reviewed}</td>
                                <td>\${review.tokens_used}</td>
                            \`;

                            tableBody.appendChild(row);
                        });
                    });
                })
                .catch(error => {
                    console.error("Error fetching review stats:", error);
                    tableBody.innerHTML = "<tr><td colspan='6'>Error loading data</td></tr>";
                });
        });
    </script>
</body>
</html>
`;
