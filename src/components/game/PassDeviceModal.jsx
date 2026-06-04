import '../../styles/PassDeviceModal.css'

export default function PassDeviceModal({ playerName, onConfirm }) {
  return (
    <div className="pass-device-screen">
      <div className="pass-device-box">
        <div className="pass-icon">📱</div>
        <h2>Device Pass Karo!</h2>
        <p className="pass-name">
          <strong>{playerName}</strong> ki baari hai
        </p>
        <p className="pass-sub">Dusre players apni screen mat dekho!</p>
        <button className="btn-primary btn-large" onClick={onConfirm}>
          Main {playerName} hoon — Ready!
        </button>
      </div>
    </div>
  )
}
