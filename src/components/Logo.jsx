export default function Logo({ size = 'md', showText = false }) {
  const sizes = {
    sm: { img: 48 },
    md: { img: 100 },
    lg: { img: 140 },
    sidebar: { img: 44 },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className="flex flex-col items-center">
      <img
        src="/assets/logo.png"
        alt="PsicoAmina"
        style={{ width: s.img, height: s.img }}
        className="rounded-xl object-contain"
        draggable={false}
      />
      {showText && (
        <h1 className="text-2xl font-bold text-primary-600 mt-2">
          PsicoAmina
        </h1>
      )}
    </div>
  )
}
