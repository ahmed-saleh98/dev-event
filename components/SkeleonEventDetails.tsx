const SkeletonEventDetails = () => {
  return (
    <section id="event">
      <div className="header">
        <div className="skeleton h-8 w-3/5 mb-2"></div>
        <div className="skeleton h-4 w-4/5"></div>
      </div>

      <div className="details">
        {/* Left Side - Event Content */}
        <div className="content">
          <div className="skeleton banner w-full h-96 mb-4"></div>

          <section className="flex-col-gap-2">
            <div className="skeleton h-6 w-1/4 mb-2"></div>
            <div className="skeleton h-4 w-full mb-1"></div>
            <div className="skeleton h-4 w-5/6"></div>
          </section>

          <section className="flex-col-gap-2">
            <div className="skeleton h-6 w-1/3 mb-2"></div>
            <div className="skeleton h-4 w-3/4 mb-1"></div>
            <div className="skeleton h-4 w-2/3 mb-1"></div>
            <div className="skeleton h-4 w-1/2 mb-1"></div>
            <div className="skeleton h-4 w-3/5 mb-1"></div>
            <div className="skeleton h-4 w-2/5"></div>
          </section>

          <div className="agenda">
            <div className="skeleton h-6 w-1/5 mb-2"></div>
            <ul>
              <li className="skeleton h-4 w-4/5 mb-1"></li>
              <li className="skeleton h-4 w-3/5 mb-1"></li>
              <li className="skeleton h-4 w-2/5"></li>
            </ul>
          </div>

          <section className="flex-col-gap-2">
            <div className="skeleton h-6 w-2/5 mb-2"></div>
            <div className="skeleton h-4 w-full mb-1"></div>
            <div className="skeleton h-4 w-4/5"></div>
          </section>

          <div className="flex flex-row gap-1.5 flex-wrap">
            <div className="skeleton pill w-16 h-6"></div>
            <div className="skeleton pill w-20 h-6"></div>
            <div className="skeleton pill w-14 h-6"></div>
          </div>
        </div>

        {/* Right Side - Booking Form */}
        <aside className="booking">
          <div className="signup-card">
            <div className="skeleton h-6 w-2/5 mb-2"></div>
            <div className="skeleton h-4 w-4/5 mb-4"></div>
            <div className="skeleton h-10 w-full"></div>
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <div className="skeleton h-6 w-1/4 mb-4"></div>
        <div className="events flex gap-4">
          <div className="skeleton w-64 h-48"></div>
          <div className="skeleton w-64 h-48"></div>
          <div className="skeleton w-64 h-48"></div>
        </div>
      </div>
    </section>
  );
};

export default SkeletonEventDetails;
