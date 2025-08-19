// src/pages/Dashboard.tsx
export default function Dashboard() {
  return (
    <div className="row mg-top-10">
      {/* Buraya kartlar/grafikler – template’teki kutuları teker teker taşıyabilirsin */}
      <div className="col-lg-3 col-md-6 col-12">
        <div className="sherah-progress-card sherah-border sherah-default-bg mg-top-30">
          <div className="sherah-progress-card__icon sherah-default-bg sherah-border">
            {/* svg */}
          </div>
          <div className="sherah-progress-card__content">
            <h4 className="sherah-progress-card__title">Total Sells</h4>
            <p className="sherah-progress-card__number">$654.66k</p>
          </div>
        </div>
      </div>

      {/* ... diğer gridler */}
    </div>
  );
}
