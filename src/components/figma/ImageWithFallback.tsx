import React, { useState, useEffect } from 'react'
import { fetchWithAuth } from '../../utils/fetchWithAuth'
import { API_URL } from '../../url'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

const isSharePointUrl = (url: string | undefined): boolean => {
  if (!url) return false
  return url.includes('sharepoint.com') || url.includes('.sharepoint.')
}

const getProxyUrl = (originalUrl: string): string => {
  // Usar endpoint proxy del backend
  return `${API_URL}/images/proxy?url=${encodeURIComponent(originalUrl)}`
}

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { src, alt, style, className, ...rest } = props

  useEffect(() => {
    console.log('🖼️ ImageWithFallback - src:', src)
    console.log('🖼️ isSharePointUrl:', isSharePointUrl(src))
    
    // Si es una URL de SharePoint, cargarla a través del proxy del backend
    if (src && isSharePointUrl(src) && !blobUrl && !didError) {
      console.log('🖼️ Loading SharePoint image via proxy...')
      setIsLoading(true)
      
      const proxyUrl = getProxyUrl(src)
      console.log('🖼️ Proxy URL:', proxyUrl)
      
      fetchWithAuth(proxyUrl)
        .then(async (response) => {
          console.log('🖼️ Proxy response status:', response.status)
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`)
          }
          const blob = await response.blob()
          console.log('🖼️ Blob created, size:', blob.size)
          const objectUrl = URL.createObjectURL(blob)
          console.log('🖼️ Object URL created:', objectUrl)
          setBlobUrl(objectUrl)
        })
        .catch((error) => {
          console.error('❌ Failed to load SharePoint image via proxy:', error)
          setDidError(true)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }

    // Cleanup blob URL when component unmounts
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [src, blobUrl, didError])

  const handleError = () => {
    setDidError(true)
  }

  // Usar blob URL si está disponible, de lo contrario usar src original
  const imageSrc = blobUrl || src

  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        className={`inline-block bg-gray-50 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-pulse bg-gray-200 w-full h-full rounded" />
        </div>
      </div>
    )
  }

  return (
    <img src={imageSrc} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
