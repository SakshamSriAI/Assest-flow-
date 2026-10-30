import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Asset } from '../../types'
import { QrCode, Printer, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react'

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  asset: Asset | null
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, asset }) => {
  const [copied, setCopied] = React.useState(false)

  if (!asset) return null

  const handleCopyTag = () => {
    navigator.clipboard?.writeText(asset.tag)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Printable Physical Asset Badge: ${asset.tag}`}
      description="Standardized thermal sticker & QR identification format for physical tagging."
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Printable Physical Tag Card */}
        <div className="p-5 rounded-2xl bg-white border-2 border-slate-900 shadow-md text-center space-y-3 font-sans relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">
                AF
              </div>
              <span className="font-extrabold text-xs tracking-tight text-slate-900">
                Asset<span className="text-indigo-600">Flow</span>
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
              {asset.departmentName.split(' ')[0]}
            </span>
          </div>

          {/* SVG QR Code Simulation Pattern */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block mx-auto">
            <svg
              className="w-36 h-36 mx-auto text-slate-900"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer corners */}
              <rect x="5" y="5" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="6" />
              <rect x="13" y="13" width="12" height="12" rx="2" fill="currentColor" />

              <rect x="67" y="5" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="6" />
              <rect x="75" y="13" width="12" height="12" rx="2" fill="currentColor" />

              <rect x="5" y="67" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="6" />
              <rect x="13" y="75" width="12" height="12" rx="2" fill="currentColor" />

              {/* Data matrix dots */}
              <rect x="42" y="10" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="54" y="10" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="42" y="24" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="52" y="24" width="8" height="8" rx="1" fill="currentColor" />

              <rect x="10" y="42" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="22" y="42" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="40" y="42" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="54" y="42" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="68" y="42" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="82" y="42" width="8" height="8" rx="1" fill="currentColor" />

              <rect x="42" y="56" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="54" y="56" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="42" y="70" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="54" y="70" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="42" y="84" width="6" height="6" rx="1" fill="currentColor" />

              <rect x="68" y="68" width="10" height="10" rx="1" fill="currentColor" />
              <rect x="82" y="68" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="74" y="82" width="12" height="10" rx="1" fill="currentColor" />
            </svg>
          </div>

          <div className="space-y-1">
            <span className="font-mono font-extrabold text-base tracking-widest text-slate-900 block">
              {asset.tag}
            </span>
            <p className="text-xs font-semibold text-slate-800 truncate px-2">
              {asset.name}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              SN: {asset.serialNumber || 'N/A'} &bull; Loc: {asset.location}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
            <span>Scan via AssetFlow Mobile / Barcode Gun</span>
            <span className="text-indigo-600 font-bold">VERIFIED</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleCopyTag}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Tag Copied' : 'Copy Asset Tag'}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Barcode Label
          </Button>
        </div>
      </div>
    </Modal>
  )
}
