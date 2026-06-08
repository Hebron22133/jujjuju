import React, { useState } from 'react'
import { NIGERIAN_BANKS } from '@/lib/banks'

interface BankInfoModalProps {
  userId: string
  currentBank?: {
    bank_name: string
    bank_code: string
    account_number: string
    account_holder_name?: string
  }
  onClose: () => void
  onSave: () => void
}

export function BankInfoModal({ userId, currentBank, onClose, onSave }: BankInfoModalProps) {
  const [selectedBank, setSelectedBank] = useState(currentBank?.bank_code || '')
  const [accountNumber, setAccountNumber] = useState(currentBank?.account_number || '')
  const [accountName, setAccountName] = useState(currentBank?.account_holder_name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async () => {
    if (!selectedBank || !accountNumber) {
      setError('Please select a bank and enter account number')
      return
    }

    if (accountNumber.length !== 10) {
      setError('Account number must be 10 digits')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const bankInfo = NIGERIAN_BANKS.find(b => b.code === selectedBank)
      if (!bankInfo) {
        throw new Error('Bank not found')
      }

      const response = await fetch('/api/user/update-bank-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          bank_code: selectedBank,
          bank_name: bankInfo.name,
          account_number: accountNumber,
          account_holder_name: accountName || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save bank info')
      }

      setSuccess('Bank information saved successfully!')
      setTimeout(() => {
        onSave()
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedBankObj = NIGERIAN_BANKS.find(b => b.code === selectedBank)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Update Bank Account</h2>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '5px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            padding: '12px',
            borderRadius: '5px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Select Bank
          </label>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          >
            <option value="">-- Choose a bank --</option>
            {NIGERIAN_BANKS.map(bank => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Account Number (10 digits)
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="1234567890"
            maxLength={10}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '14px',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            Account Holder Name (optional)
          </label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Full name on account"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '14px',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {selectedBankObj && (
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '12px',
            borderRadius: '5px',
            marginBottom: '20px',
            fontSize: '13px'
          }}>
            <strong>Preview:</strong><br/>
            Bank: {selectedBankObj.name}<br/>
            Account: {accountNumber || '••••••••••'}<br/>
            {accountName && <>Name: {accountName}</>}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              backgroundColor: '#f5f5f5',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !selectedBank || !accountNumber}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: loading || !selectedBank || !accountNumber ? '#ccc' : '#ff9900',
              color: 'white',
              cursor: loading || !selectedBank || !accountNumber ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Saving...' : 'Save Bank Info'}
          </button>
        </div>
      </div>
    </div>
  )
}
