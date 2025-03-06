(function () {
        // Create styles for the consent banner
        const style = document.createElement("style");
        style.innerHTML = `
            .consent-banner {
                position: fixed;
                top : 50%;
                left: 50%;
                transform: translate(-50%,-50%);
                width: 600px;
                height: 500px;
                background: #F3F3F3;
                border-radius: 5px;
                padding: 20px;
                box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
                font-family: Arial, sans-serif;
                z-index: 1000;
                color: #494949;
                display: flex;
                flex-direction: column;

            }
            .banner-content {
                display: flex;
                flex-direction: column;
                flex-grow: 1; /* Allows it to expand while keeping actions at the bottom */
                overflow: hidden;
            }

            .consent-banner * {
                max-width: 100%; /* Prevents elements from exceeding the container */
                box-sizing: border-box; /* Ensures padding/margins don't break layout */
                overflow-wrap: break-word; /* Prevents long text from overflowing */
            }
            .banner-description a {
                font-size: 11px;
            }
            .banner-description h3 {
                font-size: 16px;
                color: #494949;
                margin: 6px 0px;
            }
            .banner-description p {
                font-size: 14px;
                color: #494949;
                margin: 6px 0px;
            }

            .banner-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .logo {
                width: 100px;
            }
                
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
            }

            .purposes {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                padding: 2px;
                margin: 10px 0;
                height: auto; 
                overflow-y: auto; /* Enables scrolling only if content overflows */
                padding-right: 10px; /* Prevents content from being cut off */
            }

            .banner-purpose {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #F3F3F3;
                font-size: 14px; 
                padding: 0px 10px;
                border-radius: 5px;
                margin-bottom: 10px;
                box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
                width: 100%;
                min-height: auto;
                flex-wrap: nowrap; /* Prevents switch from wrapping */
            }
            .banner-purpose div {
                flex-grow: 1;
                min-width: 0;
                word-break: break-word; /* Ensures text wraps properly */
                padding-right: 10px; /* Creates space between text and switch */
                margin-bottom: 10px;
            }
            .banner-purpose div h4, p{
                margin: 10px 0 0 0;
            }

            .switch {
                flex-shrink: 0;
                position: relative;
                display: inline-block;
                width: 34px;
                height: 20px;
                margin-left: 10px;
                align-self: center;
            }

            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                border-radius: 20px;
                transition: 0.4s;
            }

            .slider:before {
                position: absolute;
                content: "";
                height: 14px;
                width: 14px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                border-radius: 50%;
                transition: 0.4s;
            }

            input:checked + .slider {
                background-color: #4caf50;
            }

            input:checked + .slider:before {
                transform: translateX(14px);
            }

            .banner-actions {
                flex: none;
                display: flex;
                justify-content: space-between;
                gap: 10px;
            }

            .agree-btn, .reject-btn {
                flex: 1;
                align-text: center;
                padding: 12px 2px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                font-weight: normal;
                background: #0066B2;
                color: #ccc;
            }

            .agree-btn:hover {
                background: #0DB04B;
                color: white;
            }
            .reject-btn:hover {
                background: #F26F21;
                color: white;
            }

            .powered-by {
                text-align: center;
                margin: 10px 0 0 0;
                font-size: 11px;
            }
            .divider {
                border: none;
                height: 1px !important;
                background: #ccc; /* Light gray line */
                margin: 10px 0;
            }
            /* Optional scrollbar styling */
            .purposes::-webkit-scrollbar {
                width: 5px;
            }

            .purposes::-webkit-scrollbar-thumb {
                background-color: #fff;
                border-radius: 10px;
            }
        `;
        document.head.appendChild(style);

        // Create the consent banner container
        const consentBanner = document.createElement("div");
        consentBanner.classList.add("consent-banner");
        consentBanner.innerHTML = `
            <div class="banner-header">
                <img src="https://fpt.edu.vn/Content/images/assets/img-logo-fe.png" alt="FPT Education" class="logo">
                <button class="close-btn">&times;</button>
            </div>
            <hr class="divider">
            <div class="banner-content">
                <div class="banner-description">
                    <h3>Cài đặt</h3>
                    <p>Hệ thống sẽ thu thập xử lý dữ liệu theo các mục đích xử lý dữ liệu được liệt kê bên dưới bạn có thể chọn và tùy chỉnh theo ý muốn và gửi sự đồng ý hoặc từ chối.</p>
                    <a href="#">Quy định về bảo vệ dữ liệu</a>    
                </div>
                <hr class="divider">
                <div class="purposes">
                    <div class="banner-purpose">
                        <div>
                            <h4>Phân tích dữ liệu</h4>
                            <p>Chúng tôi sẽ sử dụng dữ liệu của bạn cho mục đích phân tích dữ liệu nhằm cải thiện và nâng cao chất lượng dịch vụ.</p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" data-purpose="data-analysis">
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="banner-purpose">
                        <div>
                            <h4>Nghiên cứu và phát triển phần mềm</h4>
                            <p>Các thông tin về bạn sẽ được sử dụng cho mục đích nghiên cứu phát triển cải thiện phần mềm trong thời gian sắp tới.</p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" data-purpose="software-research">
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="banner-purpose">
                        <div>
                            <h4>Quản lý tài khoản</h4>
                            <p>Thông tin về tài khoản của bạn sẽ được lưu lại nhằm mục đích quản lý người dùng và truy cập vào hệ thống. Thông tin về tài khoản của bạn sẽ được lưu lại nhằm mục đích quản lý người dùng và truy cập vào hệ thống.Thông tin về tài khoản của bạn sẽ được lưu lại nhằm mục đích quản lý người dùng và truy cập vào hệ thống.</p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" data-purpose="account-management">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                <hr class="divider">
                <div class="banner-actions">
                    <button class="agree-btn">Gửi sự đồng ý</button>
                    <button class="reject-btn">Từ chối</button>
                </div>

                <p class="powered-by">powered by <strong>DPMS</strong></p>
            </div>
        `;

        document.body.appendChild(consentBanner);

        // Event Listeners
        const agreeBtn = consentBanner.querySelector(".agree-btn");
        const rejectBtn = consentBanner.querySelector(".reject-btn");
        const closeButton = consentBanner.querySelector(".close-btn");
        const checkboxes = consentBanner.querySelectorAll(".switch input");

        agreeBtn.addEventListener("click", () => {
            const consentData = {};
            checkboxes.forEach((checkbox) => {
                consentData[checkbox.dataset.purpose] = checkbox.checked;
            });

            console.log("Consent Given:", consentData);
            alert("Bạn đã gửi sự đồng ý!");
            consentBanner.style.display = "none";
        });

        rejectBtn.addEventListener("click", () => {
            console.log("Consent Rejected");
            alert("Bạn đã từ chối!");
            consentBanner.style.display = "none";
        });

        closeButton.addEventListener("click", () => {
            consentBanner.style.display = "none";
        });
    })();
