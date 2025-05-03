(function () {
  // ——— CONFIG ———
  const script = document.currentScript;
  const systemId = script.getAttribute("data-system-id");
  const uString = script.getAttribute("data-uString");
  const API_CONSENT_BASE =
    script.getAttribute("data-dpms-api-base-consent") ||
    "https://localhost:7226/api-cjs";
  const API_DSAR_BASE =
    script.getAttribute("data-dpms-api-base-dsar") ||
    "https://localhost:7226/api-cjs";
  const API_POLICY_BASE =
    script.getAttribute("data-dpms-api-base-policy") ||
    "https://localhost:7226/api-cjs";

  if (!systemId || !uString) {
    console.error("ConsentSDK: Missing required attributes");
    return;
  }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // ——— SHADOW ROOT ———
        const host = document.createElement('div');
        host.id = 'dpms-consent-root';
        const shadow = host.attachShadow({ mode: 'open' });
        Object.assign(host.style, {
            all: 'initial',
            display: 'block',
        });
        document.body.appendChild(host);

        const STORAGE_KEY = `dpmsConsent_${uString}`;

        // ——— INJECT STYLES ONCE ———
        const styleEl = document.createElement("style");
        styleEl.textContent = `/* =========================
   Variables & Overlay
   ========================= */
:host {
  /* Overlay */
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9999;

  /* Custom properties */
  --primary: #f37021;
  --primary-dark: #1976D2;
  --success: #4CAF50;
  --gray-light: #f5f5f5;
  --gray: #ddd;
  --gray-dark: #777;
  --text: #333;
  --text-light: #666;
  --shadow: 0 4px 10px rgba(0,0,0,0.1);
  --radius: 8px;
  --font: 'Segoe UI', Roboto, -apple-system, sans-serif;
  --transition: all 0.2s ease;
}

/* =========================
   Global Resets
   ========================= */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* =========================
   Keyframes
   ========================= */
@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -48%); }
  to   { opacity: 1; transform: translate(-50%, -50%); }
}
@keyframes fadeOut {
  from { opacity: 1; transform: translate(-50%, -50%); }
  to   { opacity: 0; transform: translate(-50%, -52%); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* =========================
   Consent Banner
   ========================= */
.consent-banner {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 650px;       
  max-width: 90vw;    
  height: 600px;      
  max-height: 95vh;   
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
  font: 14px var(--font);
  color: var(--text);
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;
}

/* =========================
   Layout Helpers
   ========================= */
.banner-header,
.banner-actions,
.form-row {
  display: flex;
}
.banner-header { justify-content: space-between; align-items: center; margin-bottom: 8px; }
.banner-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.banner-actions { justify-content: space-between; gap: 12px; margin-top: 16px; }

/* =========================
   Typography
   ========================= */
.banner-description {
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-light);
  margin-bottom: 12px;
}
.banner-description a {
  color: var(--primary);
  text-decoration: none;
  transition: var(--transition);
}
.banner-description a:hover {
  text-decoration: underline;
}

/* =========================
   Tabs
   ========================= */
.banner-tabs {
  display: flex;
  border: 1px solid var(--gray);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 12px;
}
.banner-tabs button {
  flex: 1;
  padding: 10px 0;
  font: 13px var(--font);
  font-weight: 500;
  color: var(--text-light);
  background: var(--gray-light);
  border: none;
  transition: var(--transition);
  position: relative;
}
.banner-tabs button + button { border-left: 1px solid var(--gray); }
.banner-tabs button.active {
  background: #fff;
  color: var(--primary);
}
.banner-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 100%; height: 2px;
  background: var(--primary);
}

/* =========================
   Purpose Items
   ========================= */
.purposes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  padding: 4px 2px;
}
.banner-purpose {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: var(--radius);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  font-size: 12px;
  transition: var(--transition);
}
.banner-purpose:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}
.banner-purpose > div {
  flex: 1;
  min-width: 0;
  padding-right: 12px;
}
.banner-purpose h4 {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.banner-purpose p {
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-light);
}

/* =========================
   Toggle Switch
   ========================= */
.switch {
  position: relative;
  width: 40px; height: 22px;
  margin-left: 8px;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  inset: 0;
  border-radius: 22px;
  background: var(--gray);
  cursor: pointer;
  transition: var(--transition);
}
.slider::before {
  content: '';
  position: absolute;
  left: 3px; bottom: 3px;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: var(--transition);
}
.switch input:checked + .slider {
  background: var(--primary);
}
.switch input:checked + .slider::before {
  transform: translateX(18px);
}

/* =========================
   Buttons
   ========================= */
.agree-btn, .reject-btn , .accept-all-btn{
  flex: 1;
  padding: 10px 8px;
  font: 14px var(--font);
  font-weight: 500;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
}
.agree-btn {
  background: #fff;
  color: var(--text);
  border: 1px solid var(--gray);
}
.accept-all-btn,
.reject-btn {
  background: var(--primary);
  color: #fff;
}
.agree-btn:hover, .reject-btn:hover, .accept-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}
.agree-btn:hover {
  background: var(--gray-light);
}
.accept-all-btn:hover,
.reject-btn:hover {
  background: darkorange;
}
.close-btn {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  color: var(--gray-dark);
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
}
.close-btn:hover {
  background-color: var(--gray-light);
  color: var(--text);
}
/* =========================
   Forms & Iframe
   ========================= */
.dsar-form,
#panel-dsar {
  overflow-y: auto;
}
.dsar-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.form-group label {
  font: 12px var(--font);
  color: var(--text-light);
  font-weight: 500;
}
.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid var(--gray);
  border-radius: var(--radius);
  font: 13px var(--font);
  transition: var(--transition);
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(33,150,243,0.1);
}
.submit-dsar {
  align-self: center;
  padding: 10px 24px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}
.submit-dsar:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(33,150,243,0.2);
}
.policy-frame {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: var(--radius);
  background: var(--gray-light);
}
.form-row {
  display: flex;
  flex-wrap: wrap;
  /* bù –6px hai bên để giữ khoảng cách 12px */
  margin: 0 -6px;
}
.form-row > .form-group {
  flex: 1 1 0;
  min-width: 0;
  padding: 0 6px;
}

/* 3. Chiều cao cố định và border-radius đồng nhất cho các control */
.form-group input,
.form-group select {
  height: 40px;                  /* đồng nhất chiều cao */
  border: 1px solid var(--gray);
  border-radius: var(--radius);
  padding: 0 12px;
}
.form-group textarea {
  min-height: 80px;              /* đủ cao để nhập mô tả */
  border: 1px solid var(--gray);
  border-radius: var(--radius);
  padding: 10px 12px;
  resize: vertical;
}

/* Focus state */
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(33,150,243,0.1);
}

/* =========================
   Miscellaneous
   ========================= */
.powered-by {
  text-align: center;
  margin-top: 12px;
  font-size: 11px;
  color: #999;
}
.powered-by strong { color: var(--text-light); }
.divider {
  height: 1px;
  background: #eee;
  border: none;
  margin: 10px 0;
}
.hidden { display: none !important; }

/* =========================
   Quick-Access Icon
   ========================= */
.open-consent-icon {
  position: fixed;
  bottom: 20px; right: 20px;
  width: 48px; height: 48px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(33,150,243,0.2);
  cursor: pointer;
  transition: var(--transition);
  z-index: 10001;
}
.open-consent-icon:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(33,150,243,0.3);
}
.open-consent-icon svg {
  width: 22px; height: 22px;
  fill: #fff;
}

/* =========================
   Scrollbar Styling
   ========================= */
.purposes::-webkit-scrollbar,
.tab-panel::-webkit-scrollbar { width: 5px; }
.purposes::-webkit-scrollbar-track,
.tab-panel::-webkit-scrollbar-track {
  background: var(--gray-light);
  border-radius: 10px;
}
.purposes::-webkit-scrollbar-thumb,
.tab-panel::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
.purposes::-webkit-scrollbar-thumb:hover,
.tab-panel::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

/* =========================
   Tab Panels
   ========================= */
.tab-panel {
  display: none;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}
.tab-panel.active {
  display: block;
}

/* =========================
   Responsive Adjustments
   ========================= */
@media (max-width: 640px) {
  .consent-banner {
     width: 96vw;      
    height: 90vh;    
    padding: 16px;
    border-radius: 10px;
  }
  .banner-content { max-height: calc(85vh - 150px); }
  .form-row { flex-direction: column; gap: 10px; }
  .banner-tabs button { padding: 8px 0; font-size: 12px; }
  .form-group input,
  .form-group select,
  .form-group textarea { font-size: 16px; padding: 10px 12px; }
  .banner-purpose { padding: 10px; }
  .banner-purpose h4 { font-size: 13px; }
  .banner-actions { margin-top: 12px; }
  .agree-btn, .reject-btn { padding: 12px 8px; }
}
.logo {
  height: 36px;
  max-width: 100%;
  object-fit: contain;
}

@media (max-width: 480px) {
  .consent-banner {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    padding: 12px;
  }
  .banner-content { max-height: calc(100vh - 150px); }
  .logo { height: 30px; }
  .banner-tabs { margin-bottom: 10px; }
  .consent-banner .dsar-form input:invalid,
  .consent-banner .dsar-form select:invalid,
  .consent-banner .dsar-form textarea:invalid {
    border-color: #e53935 !important;
    box-shadow: 0 0 0 2px rgba(244,67,54,0.2);
  }
}
`;
        shadow.appendChild(styleEl);

        // ——— STORAGE HELPERS ———
        const store = {
            get() {
                try {
                    return JSON.parse(localStorage.getItem(STORAGE_KEY));
                } catch {
                    return null;
                }
            },
            set(record) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
            },
        };

        // ——— API CALLS ———
        async function fetchConsent() {
            try {
                const res = await fetch(
                    `${API_CONSENT_BASE}/banner/${uString}/${systemId}`,
                    { credentials: "omit" }
                );
                if (res.status === 200) return res.json();
                if (res.status === 404) return null;
                throw new Error(`Consent GET failed: ${res.status}`);
            } catch (error) {
                console.error("Error fetching consent data:", error);
                return null;
            }
        }

        async function fetchPolicy() {
            try {
                const res = await fetch(`${API_POLICY_BASE}/get-policy`, {
                    credentials: "omit",
                });
                if (!res.ok)
                    throw new Error(`Policy GET failed with status ${res.status}`);
                return res.json();
            } catch (error) {
                console.error("Error fetching policy data:", error);
                return {};
            }
        }

        async function submitConsent(purposes, isWithdrawn = false) {
            let consentIp = "";
            try {
                const ipResponse = await fetch("https://api.ipify.org?format=json");
                const ipData = await ipResponse.json();
                consentIp = ipData.ip;
            } catch (error) {
                console.warn("Could not fetch IP address:", error);
            }

            const payload = {
                dataSubjectId: uString,
                email: uString,
                consentMethod: 0,
                consentIp,
                consentUserAgent: navigator.userAgent,
                externalSystemId: systemId,
                isWithdrawn,
                withdrawnDate: new Date().toISOString(),
                consentPurposes: purposes,
            };

            try {
                const res = await fetch(`${API_CONSENT_BASE}/consent-js`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const errBody = await res.json().catch(() => ({}));
                    throw new Error(
                        `Consent POST failed ${res.status}: ${JSON.stringify(errBody)}`
                    );
                }

                // read as text first
                const text = await res.text();
                let record = null;
                if (text) {
                    try {
                        record = JSON.parse(text);
                    } catch (e) {
                        console.warn("submitConsent: response was not valid JSON", e);
                    }
                }

                // optionally store only if you got a real record
                store.set(record);
                return record;
            } catch (error) {
                console.error("Error submitting consent:", error);
                throw error;
            }
        }

        // ——— TEMPLATES ———
        function buildPurposeItem(p) {
            const checked = p.status === true || p.status === "True" ? "checked" : "";
            return `
        <div class="banner-purpose" data-purpose-id="${p.purposeId}">
          <div>
            <h4>${p.purposeName}</h4>
            <p>${p.purposeDescription || ""}</p>
          </div>
          <label class="switch">
            <input type="checkbox" ${checked} />
            <span class="slider"></span>
          </label>
        </div>
      `;
        }

        function buildBanner(purposes = [], policy = {}) {
            // normalize title & content keys
            const title = policy.Title || policy.title || "Chính sách bảo mật";
            const content =
                policy.Content || policy.content || "<p>Không có nội dung.</p>";

            return `
        <div class="banner-header">
          <img
            src="https://cdn.haitrieu.com/wp-content/uploads/2021/10/Logo-Dai-hoc-FPT.png"
            alt="FPT Education"
            class="logo"
          />
          <button type="button" class="close-btn">&times;</button>
        </div>
        <hr class="divider" />
        <div class="banner-description">
        FPT Edu sử dụng dữ liệu cá nhân để cung cấp và cải thiện dịch vụ của chúng tôi. Để biết thêm thông tin, vui lòng xem lại Chính sách Bảo vệ Dữ liệu của chúng tôi.
        </div>
        <div class="banner-tabs">
          <button type="button" data-tab="consent" class="active">Cài đặt</button>
          <button  type="button" data-tab="policy">Chính sách</button>
          <button type="button" data-tab="dsar">Yêu cầu dữ liệu</button>
        </div>
        <div class="banner-content">
          <div id="panel-consent" class="tab-panel active">
            <div class="purposes">
              ${purposes.map(buildPurposeItem).join("")}
            </div>
          </div>
          <div id="panel-policy" class="tab-panel">
            <iframe
              class="policy-frame"
              sandbox
              srcdoc="${content.replace(/"/g, "&quot;")}"
            ></iframe>
          </div>
          <div id="panel-dsar" class="tab-panel">
            <form class="dsar-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Họ và Tên</label>
                  <input type="text" name="fullName" placeholder="Nguyễn Văn A" required />
                </div>
                <div class="form-group">
                  <label>Địa chỉ Email</label>
                  <input type="email" name="email" placeholder="nguyenvana@example.com" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Số Điện Thoại</label>
                  <input type="tel" name="phone" placeholder="+84901234567" required pattern="^\+?\d{7,15}$"
       title="Nhập số điện thoại hợp lệ, gồm 7–15 chữ số, có thể có dấu +" />
                </div>
                <div class="form-group">
                  <label>Loại Yêu Cầu</label>
                  <select name="requestType" required>
                    <option value="">Chọn loại yêu cầu</option>
                    <option value="access">Truy cập dữ liệu</option>
                    <option value="delete">Xóa dữ liệu</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Địa Chỉ</label>
                <input type="text" name="address" placeholder="123 Đường ABC, Thành phố, Quốc gia" />
              </div>
              <div class="form-group">
                <label>Mô Tả</label>
                <textarea name="description" rows="3" placeholder="Cung cấp thêm chi tiết về yêu cầu của bạn…"></textarea>
              </div>
              <button type="submit" class="submit-dsar">Gửi yêu cầu</button>
            </form>
          </div>
        </div>
        <hr class="divider" />
       <div class="banner-actions">
          <button class="accept-all-btn">Đồng ý toàn bộ</button>
          <button class="reject-btn">Từ chối</button>
          <button class="agree-btn">Lưu thay đổi</button>
        </div>
        <p class="powered-by">Powered by <strong>DPMS</strong></p>
      `;
        }

        // ——— RENDER & EVENTS ———
        let bannerEl;

        function showOpenIcon() {
            if (shadow.querySelector(".open-consent-icon")) return;
            const icon = document.createElement("div");
            icon.className = "open-consent-icon";
            icon.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 2c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4c-.93 0-1.78-.32-2.46-.84l-1.01 1.75c1.04.58 2.24.93 3.47.93 3.31 0 6-2.69 6-6z"/></svg>`;
            icon.onclick = openBanner;
            shadow.appendChild(icon);
        }

        async function openBanner() {
            const existingIcon = shadow.querySelector('.open-consent-icon');
            if (existingIcon) existingIcon.remove();
            // Show loading state
            if (bannerEl) bannerEl.remove();
            bannerEl = document.createElement("div");
            bannerEl.className = "consent-banner";
            bannerEl.innerHTML = `
        <div class="banner-header">
          <img
            src="https://cdn.haitrieu.com/wp-content/uploads/2021/10/Logo-Dai-hoc-FPT.png"
            alt="FPT Education"
            class="logo"
          />
          <button class="close-btn">&times;</button>
        </div>
        <hr class="divider" />
        <div style="display: flex; align-items: center; justify-content: center; flex-grow: 1;">
          <div style="text-align: center; color: #666;">
            <div style="margin-bottom: 16px;">Đang tải...</div>
            <div style="width: 36px; height: 36px; border: 3px solid #f3f3f3; border-top: 3px solid #2196F3; border-radius: 50%; display: inline-block; animation: spin 1s linear infinite;"></div>
          </div>
        </div>
      `;
            shadow.appendChild(bannerEl);

            // Attach close button event early for better UX
            shadow.querySelector(".close-btn").onclick = () => {
                bannerEl.remove();
                showOpenIcon();
            };

            // 1) Consent data (cached or fetched)
            let purposes = store.get();
            try {
                purposes = (await fetchConsent()) || [];
                store.set(purposes);
            } catch (e) {
                console.error("Error loading consent:", e);
                purposes = [];
            }

            // 2) Policy data
            let policy = {};
            try {
                policy = await fetchPolicy();
            } catch (e) {
                console.error("Error loading policy:", e);
            }

            // 3) Render full content
            bannerEl.innerHTML = buildBanner(purposes, policy);
            attachBannerEvents();
        }

        function attachBannerEvents() {
            const tabs = shadow.querySelector(".banner-tabs");
            const actions = shadow.querySelector(".banner-actions");

            // Tab delegation
            tabs.onclick = ({ target }) => {
                if (!target.dataset.tab) return;
                shadow
                    .querySelectorAll(".banner-tabs button")
                    .forEach((b) => b.classList.remove("active"));
                shadow
                    .querySelectorAll(".tab-panel")
                    .forEach((p) => p.classList.remove("active"));

                target.classList.add("active");
                shadow
                    .querySelector(`#panel-${target.dataset.tab}`)
                    .classList.add("active");
                actions.classList.toggle("hidden", target.dataset.tab !== "consent");
            };

            // Close
            shadow.querySelector(".close-btn").onclick = () => {
                // Add fade-out animation
                bannerEl.style.animation = "fadeOut 0.2s forwards";
                bannerEl.style.pointerEvents = "none";
                setTimeout(() => {
                    bannerEl.remove();
                    showOpenIcon();
                }, 200);
            };

            // ——— DSAR form submission with HTML5 validation & proper close ———
            const dsarForm = shadow.querySelector(".dsar-form");
            if (dsarForm) {
                dsarForm.addEventListener("submit", async (e) => {
                    e.preventDefault();

                    // 1) HTML5 validation
                    if (!dsarForm.checkValidity()) {
                        dsarForm.reportValidity();
                        return;
                    }

                    const submitBtn = shadow.querySelector(".submit-dsar");
                    const originalText = submitBtn.textContent;

                    // 2) Disable & show loading
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Đang gửi…";

                    let dsarType = 0;
                    if (dsarForm.requestType.value == "access") {
                        dsarType = 0;
                    }
                    if (dsarForm.requestType.value == "delete") {
                        dsarType = 1;
                    }
                    // 3) Build payload
                    const payload = {
                        requesterName: dsarForm.fullName.value,
                        requesterEmail: dsarForm.email.value,
                        phoneNumber: dsarForm.phone.value,
                        address: dsarForm.address.value,
                        description: dsarForm.description.value,
                        type: dsarType,
                        status: 0,
                        externalSystemId: systemId,
                    };

                    try {
                        // 4) Send to your DSAR endpoint
                        const res = await fetch(`${API_DSAR_BASE}/submitJS/${uString}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                        });

                        if (!res.ok) {
                            throw new Error(`Status ${res.status}`);
                        }

                        // 5) Success UI
                        submitBtn.textContent = "✓ Đã gửi thành công!";
                        submitBtn.style.background =
                            "linear-gradient(90deg, #4CAF50, #45a049)";

                        // 6) Fade‑out & close banner, then show icon again
                        setTimeout(() => {
                            bannerEl.style.animation = "fadeOut 0.2s forwards";
                            setTimeout(() => {
                                bannerEl.remove();
                                showOpenIcon();
                            }, 200);
                        }, 800);
                    } catch (err) {
                        console.error("DSAR submit failed:", err);

                        // 7) Error UI & reset
                        submitBtn.textContent = "Lỗi! Thử lại";
                        submitBtn.style.background =
                            "linear-gradient(90deg, #f44336, #e53935)";
                        setTimeout(() => {
                            submitBtn.disabled = false;
                            submitBtn.textContent = originalText;
                            submitBtn.style.background = "";
                        }, 2000);
                    }
                });
            }

            function buildList(mode) {
                return Array.from(shadow.querySelectorAll('.banner-purpose'))
                    .map(el => {
                        const id = el.dataset.purposeId;
                        const checked = el.querySelector('input').checked;
                        let status;
                        switch (mode) {
                            case 'acceptAll': status = true; break;
                            case 'agree': status = checked; break;
                            case 'reject': status = false; break;
                        }
                        return { purposeId: id, status };
                    });
            }

            // 2) Helper common submit & teardown
            async function handleSubmit(btn, list, isWithdrawn) {
                const originalText = btn.textContent;
                btn.textContent = isWithdrawn ? 'Đang từ chối...' : 'Đang lưu...';
                btn.disabled = true;

                try {
                    await submitConsent(list, isWithdrawn);
                    const purposes = (await fetchConsent()) || [];
                    store.set(purposes);

                    bannerEl.style.animation = 'fadeOut 0.3s forwards';
                    setTimeout(() => {
                        bannerEl.remove();
                        showOpenIcon();
                    }, 300);

                } catch (err) {
                    console.error(err);
                    btn.disabled = false;
                    btn.textContent = 'Lỗi! Thử lại';
                    setTimeout(() => btn.textContent = originalText, 1500);
                }
            }

            // 3) Gán event cho 3 nút
            [
                { cls: 'accept-all-btn', mode: 'acceptAll', isWithdrawn: false },
                { cls: 'agree-btn', mode: 'agree', isWithdrawn: false },
                { cls: 'reject-btn', mode: 'reject', isWithdrawn: true },
            ].forEach(({ cls, mode, isWithdrawn }) => {
                const btn = shadow.querySelector(`.${cls}`);
                btn.onclick = () => {
                    // Đối với acceptAll, trước hết check hết
                    if (mode === 'acceptAll') {
                        shadow.querySelectorAll('.banner-purpose input[type="checkbox"]')
                            .forEach(cb => cb.checked = true);
                    }

                    // Build và submit
                    const list = buildList(mode);
                    return handleSubmit(btn, list, isWithdrawn);
                };
            });
        }

        const fadeOutStyle = document.createElement("style");
        fadeOutStyle.textContent = `
        @keyframes fadeOut {
          from { opacity: 1; transform: translate(-50%, -50%); }
          to { opacity: 0; transform: translate(-50%, -52%); }
        }
      `;
        shadow.appendChild(fadeOutStyle);

        // Initialize based on existing consent status
        const cached = store.get();
        if (cached && cached.some((p) => p.status == null)) {
            // Show banner immediately if consent is required
            openBanner();
        } else {
            // Otherwise just show the icon
            showOpenIcon();
        }
    }
})();
