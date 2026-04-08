import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { user } = useAuth();

  const dealId = useMemo(() => {
    return (
      params.get("dealId") ||
      location.state?.dealId ||
      ""
    );
  }, [location.state, params]);

  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handlePay(e) {
    e.preventDefault();
    try {
      if (!dealId) {
        setStatus("error");
        setErrorMsg("Missing dealId.");
        return;
      }
      if (!address.trim()) {
        setStatus("error");
        setErrorMsg("Address is required.");
        return;
      }

      setStatus("loading");
      setErrorMsg("");

      await api.post("/orders/create", {
        dealId,
        address: address.trim()
      });

      setStatus("success");
      navigate("/orders", { replace: true });
    } catch (_err) {
      setStatus("error");
      setErrorMsg("Payment failed (mock). Could not create order.");
    }
  }

  return (
    <section className="page">
      <h1 className="pageTitle">Payment</h1>
      <p className="pageSubtitle">Mock checkout flow (no real payment).</p>

      <div className="card">
        <form className="form" onSubmit={handlePay}>
          <label className="dealLabel">
            Deal ID
            <input className="input" value={dealId} readOnly />
          </label>

          <label className="dealLabel">
            Signed in as
            <input className="input" value={user?.email ?? ""} readOnly />
          </label>

          <label className="dealLabel">
            Address
            <input
              className="input"
              placeholder="House no, street, city…"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>

          <button className="btn btnPrimary" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Processing…" : "Pay Now"}
          </button>

          {status === "error" ? <div className="errorText">{errorMsg}</div> : null}
        </form>
      </div>
    </section>
  );
}

