interface GooglePreviewProps {
  title: string
  description: string
  url: string
}

export default function GooglePreview({ title, description, url }: GooglePreviewProps) {
  // Truncate title to ~60 chars and description to ~160 chars
  const displayTitle = title.length > 60 ? title.slice(0, 57) + '...' : title
  const displayDescription = description.length > 160 ? description.slice(0, 157) + '...' : description

  return (
    <div className="bg-white rounded-lg p-4">
      <p className="text-[#1a0dab] text-lg leading-tight hover:underline cursor-pointer truncate">
        {displayTitle || 'Titulo do Post'}
      </p>
      <p className="text-[#006621] text-sm mt-1 truncate">
        {url || 'https://blog.tribhus.com.br/seu-post'}
      </p>
      <p className="text-[#545454] text-sm mt-1 line-clamp-2">
        {displayDescription || 'A descricao do seu post aparecera aqui. Escreva algo atrativo para aumentar os cliques.'}
      </p>
    </div>
  )
}
