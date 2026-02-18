import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/Icon";
import { clearAuthToken } from "../../auth/auth.storage";
import { ROUTE_PATHS } from "../../../router/paths";
import "../styles/biller-portal.css";

type TabKey = "overview" | "collections" | "settlements" | "config";

type SidebarItem = {
  key: TabKey;
  label: string;
  icon: string;
};

const sidebarItems: SidebarItem[] = [
  { key: "overview", label: "Overview", icon: "dashboard" },
  { key: "collections", label: "Collections", icon: "receipt_long" },
  { key: "settlements", label: "Settlements", icon: "account_balance" },
  { key: "config", label: "Portal Config", icon: "settings" },
];

const collectionRows = [
  {
    date: "May 24, 2024",
    meta: "14:20 PM - C-99201",
    customerRef: "0771 223 994",
    gross: "$50.00",
    fee: "-$0.75",
    net: "$49.25",
    status: "Completed",
  },
  {
    date: "May 24, 2024",
    meta: "14:15 PM - C-99202",
    customerRef: "0783 112 003",
    gross: "$120.00",
    fee: "-$1.80",
    net: "$118.20",
    status: "Completed",
  },
  {
    date: "May 24, 2024",
    meta: "13:58 PM - C-99203",
    customerRef: "0712 554 882",
    gross: "$25.00",
    fee: "-$0.38",
    net: "$24.62",
    status: "Completed",
  },
  {
    date: "May 24, 2024",
    meta: "13:45 PM - C-99204",
    customerRef: "0774 991 223",
    gross: "$10.00",
    fee: "-$0.15",
    net: "$9.85",
    status: "Completed",
  },
];

const settlementRows = [
  {
    payoutId: "ST-5521",
    date: "May 23, 2024",
    type: "Daily Payout",
    gross: "$12,400",
    net: "$11,860.5",
    reference: "REF-SCB-9920",
    status: "Settled",
  },
  {
    payoutId: "ST-5520",
    date: "May 22, 2024",
    type: "Daily Payout",
    gross: "$15,600",
    net: "$14,922",
    reference: "REF-SCB-9919",
    status: "Settled",
  },
  {
    payoutId: "ST-5519",
    date: "May 21, 2024",
    type: "Daily Payout",
    gross: "$13,200",
    net: "$12,625.5",
    reference: "REF-SCB-9918",
    status: "Settled",
  },
];

export function BillerDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [preferences, setPreferences] = useState({
    summary: true,
    payoutAlerts: true,
    lowFloatAlerts: false,
  });

  const handleExit = () => {
    clearAuthToken();
    navigate(ROUTE_PATHS.loginBiller, { replace: true });
  };

  return (
    <section className="biller-portal">
      <aside className="biller-portal-sidebar">
        <p className="biller-portal-brand">EseBills</p>

        <nav
          className="biller-portal-nav"
          aria-label="Biller portal navigation"
        >
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`biller-portal-nav-item ${
                activeTab === item.key ? "active" : ""
              }`}
              onClick={() => setActiveTab(item.key)}
            >
              <Icon name={item.icon} className="icon-sm" />
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="biller-portal-exit"
          onClick={handleExit}
        >
          <Icon name="logout" className="icon-sm" />
          Exit
        </button>
      </aside>

      <div className="biller-portal-main">
        <header className="biller-portal-topbar">
          <div>
            <p className="type-overline biller-portal-kicker">
              Biller Enterprise Dashboard
            </p>
            <h1 className="type-section-title">ZESA Prepaid</h1>
          </div>
          <div className="biller-portal-topbar-right">
            <button type="button" className="biller-portal-bell">
              <Icon name="notifications" className="icon-sm" />
              <span>2</span>
            </button>
            <div className="biller-portal-admin">
              <p>Admin Portal</p>
              <small>Verified Entity</small>
            </div>
            <button type="button" className="biller-portal-apps">
              <Icon name="widgets" className="icon-sm" />
            </button>
          </div>
        </header>

        {activeTab === "overview" ? (
          <div className="biller-view-overview">
            <section className="biller-stat-grid">
              <article className="biller-stat-card">
                <div className="biller-stat-head">
                  <p>Gross Collections</p>
                  <span className="biller-stat-icon purple">
                    <Icon name="payments" className="icon-sm" />
                  </span>
                </div>
                <h3>$12,280.50</h3>
                <span className="up">+18.2% vs LW</span>
                <svg
                  viewBox="0 0 120 30"
                  className="biller-mini-line"
                  aria-hidden
                >
                  <path d="M1 22 C18 14, 35 8, 55 15 C78 23, 94 18, 118 1" />
                </svg>
              </article>
              <article className="biller-stat-card">
                <div className="biller-stat-head">
                  <p>Total Deductions</p>
                  <span className="biller-stat-icon red">
                    <Icon name="account_tree" className="icon-sm" />
                  </span>
                </div>
                <h3>-$420.00</h3>
                <span className="up">3.4% Commission Avg</span>
                <svg
                  viewBox="0 0 120 30"
                  className="biller-mini-line red"
                  aria-hidden
                >
                  <path d="M1 6 L119 29" />
                </svg>
              </article>
              <article className="biller-stat-card">
                <div className="biller-stat-head">
                  <p>Net Settlement</p>
                  <span className="biller-stat-icon green">
                    <Icon name="check_circle" className="icon-sm" />
                  </span>
                </div>
                <h3>$11,860.50</h3>
                <span className="up">Pending Payout</span>
                <svg
                  viewBox="0 0 120 30"
                  className="biller-mini-line green"
                  aria-hidden
                >
                  <path d="M1 24 L20 13 L38 20 L68 9 L119 1" />
                </svg>
              </article>
              <article className="biller-stat-card">
                <div className="biller-stat-head">
                  <p>Collection Points</p>
                  <span className="biller-stat-icon blue">
                    <Icon name="hub" className="icon-sm" />
                  </span>
                </div>
                <h3>42 Agents</h3>
                <span className="up">Real-time Network</span>
                <svg
                  viewBox="0 0 120 30"
                  className="biller-mini-line blue"
                  aria-hidden
                >
                  <path d="M1 16 C22 13, 47 11, 68 15 C89 19, 102 23, 119 29" />
                </svg>
              </article>
            </section>

            <section className="biller-overview-grid">
              <article className="biller-panel">
                <div className="biller-panel-head">
                  <h2 className="type-title-md">Revenue Stream Analysis</h2>
                  <div className="biller-legend">
                    <span className="collections">Collections</span>
                    <span className="profit">Net Profit</span>
                  </div>
                </div>
                <div className="biller-chart">
                  <svg
                    viewBox="0 0 640 260"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <path
                      d="M0 145 C55 118, 95 95, 145 110 C210 130, 235 160, 285 125 C340 85, 395 70, 455 78 C505 88, 545 132, 640 160 L640 260 L0 260 Z"
                      className="area"
                    />
                    <path
                      d="M0 145 C55 118, 95 95, 145 110 C210 130, 235 160, 285 125 C340 85, 395 70, 455 78 C505 88, 545 132, 640 160"
                      fill="none"
                    />
                  </svg>
                  <div className="biller-chart-days" aria-hidden>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </article>

              <article className="biller-panel biller-fee-panel">
                <h2 className="type-label">Fee Structure</h2>
                <div className="biller-fee-row">
                  <div>
                    <p>Platform Service Fee</p>
                    <small>Fixed processing per item</small>
                  </div>
                  <strong>1.5%</strong>
                </div>
                <div className="biller-fee-row">
                  <div>
                    <p>Agent Commission Pool</p>
                    <small>Channel partner incentive</small>
                  </div>
                  <strong className="green">2.5%</strong>
                </div>
                <div className="biller-fee-row">
                  <div>
                    <p>Your Share Rate</p>
                    <small>Settled to your bank</small>
                  </div>
                  <strong className="underline">96.0%</strong>
                </div>
                <button type="button" className="button biller-inline-button">
                  Review Agreements
                </button>
              </article>
            </section>
          </div>
        ) : null}

        {activeTab === "collections" ? (
          <section className="biller-panel biller-table-panel">
            <div className="biller-panel-head">
              <div>
                <h2 className="type-title-md">Recent Collections</h2>
                <p className="type-label">Real-time payment inbound log</p>
              </div>
              <button type="button" className="button biller-report-button">
                Download Report
              </button>
            </div>
            <div className="biller-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Customer Ref</th>
                    <th>Gross</th>
                    <th>Fee</th>
                    <th>Net</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {collectionRows.map((row) => (
                    <tr key={row.meta}>
                      <td>
                        <strong>{row.date}</strong>
                        <small>{row.meta}</small>
                      </td>
                      <td>{row.customerRef}</td>
                      <td>{row.gross}</td>
                      <td className="neg">{row.fee}</td>
                      <td className="pos">{row.net}</td>
                      <td>
                        <span className="status-chip">{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeTab === "settlements" ? (
          <section className="biller-panel biller-table-panel">
            <div className="biller-panel-head">
              <div>
                <h2 className="type-title-md">Payout History</h2>
                <p className="type-label">Settlements to your bank account</p>
              </div>
            </div>
            <div className="biller-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Payout ID</th>
                    <th>Date</th>
                    <th>Gross Collection</th>
                    <th>Net Payout</th>
                    <th>Reference</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {settlementRows.map((row) => (
                    <tr key={row.payoutId}>
                      <td>{row.payoutId}</td>
                      <td>
                        <strong>{row.date}</strong>
                        <small>{row.type}</small>
                      </td>
                      <td>{row.gross}</td>
                      <td>{row.net}</td>
                      <td>{row.reference}</td>
                      <td>
                        <span className="status-chip">{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeTab === "config" ? (
          <div className="biller-config-grid">
            <section className="biller-panel">
              <h2 className="type-label">Organizational Profile</h2>
              <div className="biller-form-grid">
                <div>
                  <label className="type-label">Display Name</label>
                  <input value="ZESA Prepaid" readOnly />
                </div>
                <div>
                  <label className="type-label">Support Email</label>
                  <input value="billing@zesa.co.zw" readOnly />
                </div>
                <div>
                  <label className="type-label">Settlement Bank</label>
                  <input value="Standard Chartered" readOnly />
                </div>
                <div>
                  <label className="type-label">Account Number</label>
                  <input value="**** 9920" readOnly />
                </div>
              </div>
            </section>

            <section className="biller-panel">
              <h2 className="type-label">Notification Preferences</h2>
              <div className="biller-pref-list">
                <div className="biller-pref-row">
                  <div>
                    <p>Daily Collection Summary</p>
                    <small>Receive an email at 08:00 AM daily.</small>
                  </div>
                  <button
                    type="button"
                    className={`biller-toggle ${preferences.summary ? "on" : ""}`}
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        summary: !prev.summary,
                      }))
                    }
                  />
                </div>
                <div className="biller-pref-row">
                  <div>
                    <p>Payout Alerts</p>
                    <small>
                      Get notified immediately after a successful bank
                      settlement.
                    </small>
                  </div>
                  <button
                    type="button"
                    className={`biller-toggle ${
                      preferences.payoutAlerts ? "on" : ""
                    }`}
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        payoutAlerts: !prev.payoutAlerts,
                      }))
                    }
                  />
                </div>
                <div className="biller-pref-row">
                  <div>
                    <p>Low Float Alerts (Agents)</p>
                    <small>
                      Get notified when agents are low on liquidity.
                    </small>
                  </div>
                  <button
                    type="button"
                    className={`biller-toggle ${
                      preferences.lowFloatAlerts ? "on" : ""
                    }`}
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        lowFloatAlerts: !prev.lowFloatAlerts,
                      }))
                    }
                  />
                </div>
              </div>
            </section>
            <button type="button" className="button biller-save-button">
              Update Portal Settings
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
