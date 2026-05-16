export default function Landing({ setPage }) {
  const features = [
    {title: 'Study Planning',desc: 'Create manageable schedules around your classes and workload.',},
    {title: 'Academic Tracking',desc: 'Monitor assessments, deadlines, and pending tasks in one place.',},
    {title: 'AI Personas',desc: 'Switch between advisor, planner, and desi parent modes.',},
  ]

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #0f1115 0%, #171a21 80%, #2a2f3a 100%)',
        overflow: 'hidden',
      }}
    >


      <div style={{ width: '100%', maxWidth: '960px', textAlign: 'center' }}>
        <div style={{ marginBottom: '56px', textAlign: 'center' }}>

          <h1
            style={{
              fontSize: '72px',
              lineHeight: 1,
              marginBottom: '18px',
              color: 'var(--accent)',
              fontFamily: 'var(--heading-font)',
              textAlign: 'center',
              transform: 'translateY(-30px)',
            }}
          >
            StudyPolice  AI
          </h1>

          <p
            style={{
              maxWidth: '620px',
              fontSize: '25px',
              lineHeight: 1.6,
              color: 'var(--text)',
              marginBottom: '32px',
              fontFamily: 'var(--mono)',
              margin: '0 auto 32px auto',
              textAlign: 'center',
            }}
          >
            Kiun Nahein Hoti Parhai?
          </p>

          <div
            style={{
              display: 'flex',
              gap: '60px',
              alignContent: 'center',
              justifyContent: 'center'
            }}
          >
            <button
              className="btn btn-primary"
              onClick={() => setPage('dashboard')}
              style={{
                fontSize: '18px',
                padding: '16px 34px',
                fontWeight: 600,
                background: 'var(--surface)',
                fontFamily: 'var(--mono)'
            }}
            >
              Open Dashboard
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setPage('chat')}
              style={{
                fontSize: '18px',
                padding: '16px 34px',
                fontWeight: 600,
                background: 'var(--surface)',
                fontFamily: 'var(--mono)',
                borderColor: 'var(--accent)',
              }}
            >
              Open Chat
            </button>
          </div>
        </div>


        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
            gap: '60px',
            textAlign: 'center',
          }}
        >
          {features.map(feature => (
            <div
              key={feature.title}
              className="card"
            >

              <div
                style={{
                  fontSize: '25px',
                  fontWeight: '600',
                  marginBottom: '15px',
                  color: 'var(--accent)',
                  fontFamily: 'var(--mono)',
                }}
              >
                {feature.title}
              </div>


              <div
                style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: 'var(--text)',
                  fontFamily: 'var(--mono)',
                }}
              >
                {feature.desc}
              </div>

            </div>

          ))}

        </div>


      </div>


    </div>
  )

}