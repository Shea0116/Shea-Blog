import './Marquee.css'

const items = [
  'React', '·', 'Vue3', '·', 'TypeScript', '·', 'ArkTS', '·',
  'React Native', '·', 'HarmonyOS', '·', 'Redux', '·', 'Pinia', '·',
  'ECharts', '·', 'SCSS', '·', 'Webpack', '·', 'Vite', '·',
  'Ant Design', '·', 'Element Plus', '·',
]

export default function Marquee() {
  return (
    <section className="marquee">
      <div className="marquee__track">
        <div className="marquee__inner">
          {[...items, ...items, ...items, ...items].map((item, i) => (
            <span key={i} className={`marquee__item ${item === '·' ? 'dot' : ''}`}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
