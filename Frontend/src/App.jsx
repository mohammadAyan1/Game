// import PayPage from './components/PayPage'

// export default function App() {
//   // URL se txnId uthao: /pay?txnId=xxxx
//   const params = new URLSearchParams(window.location.search)
//   const txnId = params.get('txnId')

//   if (!txnId) {
//     return (
//       <div style={{
//         minHeight: '100vh', display: 'flex', alignItems: 'center',
//         justifyContent: 'center', flexDirection: 'column', gap: '16px',
//         background: '#020b18', color: '#475569',
//         fontFamily: "'Space Mono',monospace",
//       }}>
//         <svg width="60" height="60" viewBox="0 0 60 60">
//           <polygon points="30,3 57,30 30,57 3,30" fill="#7f1d1d20" stroke="#ef4444" strokeWidth="1.5" />
//           <text x="30" y="36" textAnchor="middle" fontSize="18" fill="#ef4444">!</text>
//         </svg>
//         <p style={{ fontSize: '13px', letterSpacing: '2px', color: '#ef4444' }}>
//           INVALID PAYMENT LINK
//         </p>
//         <p style={{ fontSize: '10px', color: '#334155', letterSpacing: '1px' }}>
//           txnId missing from URL
//         </p>
//       </div>
//     )
//   }

//   return <PayPage txnId={txnId} />
// }


import PayPage from './components/PayPage'

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const txnId = params.get('txnId')

  if (!txnId) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: '16px',
        background: '#020b18', fontFamily: "'Space Mono',monospace",
      }}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <polygon points="30,3 57,30 30,57 3,30" fill="#7f1d1d20" stroke="#ef4444" strokeWidth="1.5" />
          <text x="30" y="36" textAnchor="middle" fontSize="18" fill="#ef4444">!</text>
        </svg>
        <p style={{ fontSize: '12px', letterSpacing: '2px', color: '#ef4444' }}>INVALID PAYMENT LINK</p>
        <p style={{ fontSize: '10px', color: '#334155', letterSpacing: '1px' }}>txnId missing from URL</p>
      </div>
    )
  }

  return <PayPage txnId={txnId} />
}