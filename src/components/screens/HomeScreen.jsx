import '../../styles/HomeScreen.css'

export default function HomeScreen({ onPlay }) {
  return (
    <div className="home-screen">
      <div className="home-content">
        <div className="logo-area">
          <div className="logo-icon">₹</div>
          <h1 className="logo-title">Dhandha</h1>
          <p className="logo-sub">Property Card Game</p>
        </div>

        <div className="home-cards-preview">
          <div className="preview-card card-green">🏢</div>
          <div className="preview-card card-red">🏠</div>
          <div className="preview-card card-blue">🏰</div>
        </div>

        <div className="home-info">
          <p className="info-text">2–6 players • Pass & Play</p>
          <p className="info-text">3 complete property sets jitao!</p>
        </div>

        <button className="btn-primary btn-large" onClick={onPlay}>
          Khelo!
        </button>

        <div className="rules-quick">
          <h3>Quick Rules</h3>
          <ul>
            <li>Har turn mein 2 cards draw karo</li>
            <li>3 cards tak play kar sakte ho</li>
            <li>Property, Money ya Action card khelo</li>
            <li>Sabse pehle 3 complete sets — winner!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
