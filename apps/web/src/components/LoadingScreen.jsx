export default function LoadingScreen({ label = 'Loading FarmFleet…' }) {
  return (
    <div className="loading-screen">
      <div className="brand-mark">FF</div>
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}
