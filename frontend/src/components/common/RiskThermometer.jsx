import React from 'react'
import { motion } from 'framer-motion'

const RiskThermometer = ({ score, level, showLabel = true, compact = false }) => {
    const maxScore = 150
    const percentage = Math.min((score / maxScore) * 100, 100)

    const colors = {
        bajo: '#10B981',
        medio: '#F59E0B',
        alto: '#F97316',
        extremo: '#EF4444'
    }

    const currentColor = colors[level?.toLowerCase()] || '#64748B'

    return (
        <div className="risk-thermometer-container" style={{ flex: 1, padding: compact ? '0' : '0 10px' }}>
            {showLabel && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: compact ? '0.7rem' : '0.8rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--gray-500)' }}>Intensidad de Riesgo</span>
                    <motion.span
                        key={level}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ color: currentColor }}
                    >
                        {level?.toUpperCase() || 'CALCULANDO...'}
                    </motion.span>
                </div>
            )}
            <div className="thermometer-track" style={{
                height: compact ? '8px' : '12px',
                background: 'rgba(0,0,0,0.05)',
                borderRadius: '10px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(0,0,0,0.02)'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                    style={{
                        height: '100%',
                        background: currentColor,
                        borderRadius: '10px',
                        boxShadow: percentage > 0 ? `0 0 10px ${currentColor}44` : 'none'
                    }}
                />
            </div>
        </div>
    )
}

export default RiskThermometer
