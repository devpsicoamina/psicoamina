export default function Logo({ size = 'md', dark = false }) {
  const sizes = {
    sm: { img: 48 },
    md: { img: 100 },
    lg: { img: 140 },
    sidebar: { img: 44 },
  }
  const s = sizes[size] || sizes.md
  const src = dark ? '/logo-dark.png' : '/logo.png'

  return (
    <img
      src={src}
      alt="ColméIA Infantil"
      style={{ width: s.img, height: 'auto' }}
      className="object-contain"
      draggable={false}
    />
  )
}
