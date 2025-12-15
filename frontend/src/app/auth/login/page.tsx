'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authApi.login(email, password)
      console.log('Login response:', response)
      console.log('Saving to store - user:', response.user, 'token:', response.access_token)
      login(response.user, response.access_token)
      
      // Vérifier que le store a bien été mis à jour
      setTimeout(() => {
        const state = useAuthStore.getState()
        console.log('Store after login:', state)
        console.log('LocalStorage auth-storage:', localStorage.getItem('auth-storage'))
      }, 100)
      
      router.push('/home')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Illustration Only */}
      <motion.div 
        className="lg:w-1/2 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 relative overflow-hidden flex items-center justify-center p-8 lg:p-16"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.22, 1, 0.36, 1],
          delay: 0.05
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
        </div>

        {/* Centered Illustration */}
        <div className="relative z-10 w-full max-w-2xl">
          <svg viewBox="0 0 500 400" className="w-full h-auto drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
            {/* Sky background */}
            <circle cx="250" cy="200" r="200" fill="rgba(135, 206, 235, 0.3)"/>
            
            {/* Sun */}
            <g>
              <circle cx="420" cy="70" r="30" fill="rgba(255, 220, 100, 0.8)">
                <animate attributeName="r" values="30;32;30" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="420" cy="70" r="25" fill="rgba(255, 235, 150, 0.6)">
                <animate attributeName="r" values="25;27;25" dur="3s" repeatCount="indefinite"/>
              </circle>
              {/* Sun rays */}
              <g>
                <animateTransform attributeName="transform" type="rotate" values="0 420 70; 360 420 70" dur="20s" repeatCount="indefinite"/>
                <line x1="420" y1="30" x2="420" y2="40" stroke="rgba(255, 220, 100, 0.6)" strokeWidth="3" strokeLinecap="round"/>
                <line x1="460" y1="70" x2="450" y2="70" stroke="rgba(255, 220, 100, 0.6)" strokeWidth="3" strokeLinecap="round"/>
                <line x1="380" y1="70" x2="390" y2="70" stroke="rgba(255, 220, 100, 0.6)" strokeWidth="3" strokeLinecap="round"/>
                <line x1="420" y1="110" x2="420" y2="100" stroke="rgba(255, 220, 100, 0.6)" strokeWidth="3" strokeLinecap="round"/>
                <line x1="448" y1="42" x2="442" y2="48" stroke="rgba(255, 220, 100, 0.6)" strokeWidth="3" strokeLinecap="round"/>
                <line x1="448" y1="98" x2="442" y2="92" stroke="rgba(255, 220, 100, 0.6)" strokeWidth="3" strokeLinecap="round"/>
                <line x1="392" y1="42" x2="398" y2="48" stroke="rgba(255, 220, 100, 0.6)" strokeWidth="3" strokeLinecap="round"/>
                <line x1="392" y1="98" x2="398" y2="92" stroke="rgba(255, 220, 100, 0.6)" strokeWidth="3" strokeLinecap="round"/>
              </g>
            </g>
            
            {/* Clouds */}
            <ellipse cx="150" cy="80" rx="40" ry="20" fill="rgba(255,255,255,0.4)">
              <animate attributeName="cx" values="150;170;150" dur="8s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="350" cy="100" rx="50" ry="25" fill="rgba(255,255,255,0.4)">
              <animate attributeName="cx" values="350;330;350" dur="10s" repeatCount="indefinite"/>
            </ellipse>
            
            {/* Fence background */}
            <rect x="50" y="200" width="400" height="120" fill="rgba(139, 90, 60, 0.6)" rx="5"/>
            
            {/* Person 1 - Left (Orange shirt) */}
            <g>
              <animateTransform attributeName="transform" type="translate" values="0,0; 0,-8; 0,0" dur="3s" repeatCount="indefinite"/>
              {/* Shadow */}
              <ellipse cx="120" cy="350" rx="22" ry="6" fill="rgba(0,0,0,0.15)">
                <animate attributeName="rx" values="22;18;22" dur="3s" repeatCount="indefinite"/>
              </ellipse>
              {/* Body with shading */}
              <ellipse cx="120" cy="280" rx="25" ry="35" fill="#FF9966"/>
              <ellipse cx="115" cy="275" rx="8" ry="15" fill="#FF8855" opacity="0.3"/>
              {/* Shirt collar */}
              <path d="M 112 260 L 108 268 L 112 270" fill="#FF7744"/>
              <path d="M 128 260 L 132 268 L 128 270" fill="#FF7744"/>
              {/* Neck */}
              <rect x="112" y="250" width="16" height="10" fill="#FFD4A3" rx="3"/>
              {/* Head */}
              <circle cx="120" cy="230" r="25" fill="#FFD4A3"/>
              {/* Ears */}
              <ellipse cx="95" cy="230" rx="5" ry="7" fill="#FFD4A3"/>
              <ellipse cx="96" cy="230" rx="3" ry="4" fill="#FFCF9F"/>
              <ellipse cx="145" cy="230" rx="5" ry="7" fill="#FFD4A3"/>
              <ellipse cx="144" cy="230" rx="3" ry="4" fill="#FFCF9F"/>
              {/* Hair - Simple short style */}
              <ellipse cx="120" cy="215" rx="28" ry="20" fill="#8B4513"/>
              <ellipse cx="115" cy="210" rx="12" ry="15" fill="#A0522D"/>
              <ellipse cx="125" cy="210" rx="12" ry="15" fill="#A0522D"/>
              {/* Eyes */}
              <circle cx="115" cy="228" r="4" fill="#333"/>
              <circle cx="116" cy="227" r="1.5" fill="white"/>
              <circle cx="125" cy="228" r="4" fill="#333"/>
              <circle cx="126" cy="227" r="1.5" fill="white"/>
              {/* Rosy cheeks */}
              <circle cx="108" cy="235" r="5" fill="#FF9999" opacity="0.4"/>
              <circle cx="132" cy="235" r="5" fill="#FF9999" opacity="0.4"/>
              {/* Smile */}
              <path d="M 112 238 Q 120 244 128 238" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              {/* Arms up */}
              <line x1="95" y1="260" x2="80" y2="240" stroke="#FFD4A3" strokeWidth="10" strokeLinecap="round">
                <animate attributeName="y2" values="240;235;240" dur="2s" repeatCount="indefinite"/>
              </line>
              <line x1="145" y1="260" x2="160" y2="240" stroke="#FFD4A3" strokeWidth="10" strokeLinecap="round">
                <animate attributeName="y2" values="240;235;240" dur="2s" repeatCount="indefinite"/>
              </line>
              {/* Hands with fingers */}
              <g>
                <circle cx="80" cy="240" r="7" fill="#FFD4A3">
                  <animate attributeName="cy" values="240;235;240" dur="2s" repeatCount="indefinite"/>
                </circle>
                {/* Fingers */}
                <ellipse cx="77" cy="237" rx="2" ry="4" fill="#FFD4A3">
                  <animate attributeName="cy" values="237;232;237" dur="2s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="80" cy="236" rx="2" ry="5" fill="#FFD4A3">
                  <animate attributeName="cy" values="236;231;236" dur="2s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="83" cy="237" rx="2" ry="4" fill="#FFD4A3">
                  <animate attributeName="cy" values="237;232;237" dur="2s" repeatCount="indefinite"/>
                </ellipse>
              </g>
              <g>
                <circle cx="160" cy="240" r="7" fill="#FFD4A3">
                  <animate attributeName="cy" values="240;235;240" dur="2s" repeatCount="indefinite"/>
                </circle>
                {/* Fingers */}
                <ellipse cx="157" cy="237" rx="2" ry="4" fill="#FFD4A3">
                  <animate attributeName="cy" values="237;232;237" dur="2s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="160" cy="236" rx="2" ry="5" fill="#FFD4A3">
                  <animate attributeName="cy" values="236;231;236" dur="2s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="163" cy="237" rx="2" ry="4" fill="#FFD4A3">
                  <animate attributeName="cy" values="237;232;237" dur="2s" repeatCount="indefinite"/>
                </ellipse>
              </g>
              {/* Pants with seam */}
              <rect x="105" y="310" width="30" height="40" fill="#4A90E2" rx="3"/>
              <line x1="120" y1="315" x2="120" y2="345" stroke="#3A7BC8" strokeWidth="2"/>
              <rect x="107" y="312" width="5" height="35" fill="#5AA0F2" opacity="0.3"/>
              {/* Shoes with detail */}
              <ellipse cx="112" cy="350" rx="9" ry="4" fill="#2C3E50"/>
              <ellipse cx="112" cy="349" rx="7" ry="2" fill="#34495E"/>
              <line x1="108" y1="350" x2="116" y2="350" stroke="#1A252F" strokeWidth="1"/>
              <ellipse cx="128" cy="350" rx="9" ry="4" fill="#2C3E50"/>
              <ellipse cx="128" cy="349" rx="7" ry="2" fill="#34495E"/>
              <line x1="124" y1="350" x2="132" y2="350" stroke="#1A252F" strokeWidth="1"/>
            </g>

            {/* Person 2 - Center-left (Blue shirt) */}
            <g>
              <animateTransform attributeName="transform" type="translate" values="0,0; 0,-10; 0,0" dur="3.5s" begin="0.3s" repeatCount="indefinite"/>
              {/* Shadow */}
              <ellipse cx="200" cy="350" rx="22" ry="6" fill="rgba(0,0,0,0.15)">
                <animate attributeName="rx" values="22;18;22" dur="3.5s" begin="0.3s" repeatCount="indefinite"/>
              </ellipse>
              {/* Body with shading */}
              <ellipse cx="200" cy="280" rx="25" ry="35" fill="#4A90E2"/>
              <ellipse cx="195" cy="275" rx="8" ry="15" fill="#3A7BC8" opacity="0.3"/>
              {/* Shirt collar */}
              <path d="M 192 260 L 188 268 L 192 270" fill="#3A7BC8"/>
              <path d="M 208 260 L 212 268 L 208 270" fill="#3A7BC8"/>
              {/* Neck */}
              <rect x="192" y="250" width="16" height="10" fill="#FFD4A3" rx="3"/>
              {/* Head */}
              <circle cx="200" cy="230" r="25" fill="#FFD4A3"/>
              {/* Ears */}
              <ellipse cx="175" cy="230" rx="5" ry="7" fill="#FFD4A3"/>
              <ellipse cx="176" cy="230" rx="3" ry="4" fill="#FFCF9F"/>
              <ellipse cx="225" cy="230" rx="5" ry="7" fill="#FFD4A3"/>
              <ellipse cx="224" cy="230" rx="3" ry="4" fill="#FFCF9F"/>
              {/* Hair - Simple bob style */}
              <ellipse cx="200" cy="215" rx="28" ry="20" fill="#2C1810"/>
              <ellipse cx="195" cy="210" rx="12" ry="15" fill="#3D2817"/>
              <ellipse cx="205" cy="210" rx="12" ry="15" fill="#3D2817"/>
              {/* Eyes */}
              <circle cx="195" cy="228" r="4" fill="#333"/>
              <circle cx="196" cy="227" r="1.5" fill="white"/>
              <circle cx="205" cy="228" r="4" fill="#333"/>
              <circle cx="206" cy="227" r="1.5" fill="white"/>
              {/* Rosy cheeks */}
              <circle cx="188" cy="235" r="5" fill="#FF9999" opacity="0.4"/>
              <circle cx="212" cy="235" r="5" fill="#FF9999" opacity="0.4"/>
              {/* Smile */}
              <path d="M 192 238 Q 200 243 208 238" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              {/* Arms */}
              <line x1="175" y1="270" x2="170" y2="290" stroke="#FFD4A3" strokeWidth="8" strokeLinecap="round"/>
              <line x1="225" y1="270" x2="230" y2="290" stroke="#FFD4A3" strokeWidth="8" strokeLinecap="round"/>
              {/* Hands with fingers */}
              <g>
                <circle cx="170" cy="290" r="7" fill="#FFD4A3"/>
                {/* Fingers */}
                <ellipse cx="167" cy="287" rx="2" ry="4" fill="#FFD4A3"/>
                <ellipse cx="170" cy="286" rx="2" ry="5" fill="#FFD4A3"/>
                <ellipse cx="173" cy="287" rx="2" ry="4" fill="#FFD4A3"/>
              </g>
              <g>
                <circle cx="230" cy="290" r="7" fill="#FFD4A3"/>
                {/* Fingers */}
                <ellipse cx="227" cy="287" rx="2" ry="4" fill="#FFD4A3"/>
                <ellipse cx="230" cy="286" rx="2" ry="5" fill="#FFD4A3"/>
                <ellipse cx="233" cy="287" rx="2" ry="4" fill="#FFD4A3"/>
              </g>
              {/* Pants with seam */}
              <rect x="185" y="310" width="30" height="40" fill="#4A90E2" rx="3"/>
              <line x1="200" y1="315" x2="200" y2="345" stroke="#3A7BC8" strokeWidth="2"/>
              <rect x="187" y="312" width="5" height="35" fill="#5AA0F2" opacity="0.3"/>
              {/* Shoes with detail */}
              <ellipse cx="192" cy="350" rx="9" ry="4" fill="#2C3E50"/>
              <ellipse cx="192" cy="349" rx="7" ry="2" fill="#34495E"/>
              <line x1="188" y1="350" x2="196" y2="350" stroke="#1A252F" strokeWidth="1"/>
              <ellipse cx="208" cy="350" rx="9" ry="4" fill="#2C3E50"/>
              <ellipse cx="208" cy="349" rx="7" ry="2" fill="#34495E"/>
              <line x1="204" y1="350" x2="212" y2="350" stroke="#1A252F" strokeWidth="1"/>
            </g>

            {/* Person 3 - Center-right (Purple shirt) */}
            <g>
              <animateTransform attributeName="transform" type="translate" values="0,0; 0,-7; 0,0" dur="4s" begin="0.6s" repeatCount="indefinite"/>
              {/* Shadow */}
              <ellipse cx="280" cy="350" rx="22" ry="6" fill="rgba(0,0,0,0.15)">
                <animate attributeName="rx" values="22;18;22" dur="4s" begin="0.6s" repeatCount="indefinite"/>
              </ellipse>
              {/* Body with shading */}
              <ellipse cx="280" cy="280" rx="25" ry="35" fill="#9B59B6"/>
              <ellipse cx="275" cy="275" rx="8" ry="15" fill="#8B4AA6" opacity="0.3"/>
              {/* Shirt collar */}
              <path d="M 272 260 L 268 268 L 272 270" fill="#8B4AA6"/>
              <path d="M 288 260 L 292 268 L 288 270" fill="#8B4AA6"/>
              {/* Neck */}
              <rect x="272" y="250" width="16" height="10" fill="#FFD4A3" rx="3"/>
              {/* Head */}
              <circle cx="280" cy="230" r="25" fill="#FFD4A3"/>
              {/* Ears */}
              <ellipse cx="255" cy="230" rx="5" ry="7" fill="#FFD4A3"/>
              <ellipse cx="256" cy="230" rx="3" ry="4" fill="#FFCF9F"/>
              <ellipse cx="305" cy="230" rx="5" ry="7" fill="#FFD4A3"/>
              <ellipse cx="304" cy="230" rx="3" ry="4" fill="#FFCF9F"/>
              {/* Hair - Simple wavy style */}
              <ellipse cx="280" cy="215" rx="28" ry="20" fill="#D4A574"/>
              <ellipse cx="275" cy="210" rx="12" ry="15" fill="#C4956A"/>
              <ellipse cx="285" cy="210" rx="12" ry="15" fill="#C4956A"/>
              {/* Eyes */}
              <circle cx="275" cy="228" r="4" fill="#333"/>
              <circle cx="276" cy="227" r="1.5" fill="white"/>
              <circle cx="285" cy="228" r="4" fill="#333"/>
              <circle cx="286" cy="227" r="1.5" fill="white"/>
              {/* Rosy cheeks */}
              <circle cx="268" cy="235" r="5" fill="#FF9999" opacity="0.4"/>
              <circle cx="292" cy="235" r="5" fill="#FF9999" opacity="0.4"/>
              {/* Smile */}
              <path d="M 272 238 Q 280 243 288 238" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              {/* Arms */}
              <line x1="255" y1="270" x2="250" y2="290" stroke="#FFD4A3" strokeWidth="8" strokeLinecap="round"/>
              <line x1="305" y1="270" x2="310" y2="290" stroke="#FFD4A3" strokeWidth="8" strokeLinecap="round"/>
              {/* Hands with fingers */}
              <g>
                <circle cx="250" cy="290" r="7" fill="#FFD4A3"/>
                {/* Fingers */}
                <ellipse cx="247" cy="287" rx="2" ry="4" fill="#FFD4A3"/>
                <ellipse cx="250" cy="286" rx="2" ry="5" fill="#FFD4A3"/>
                <ellipse cx="253" cy="287" rx="2" ry="4" fill="#FFD4A3"/>
              </g>
              <g>
                <circle cx="310" cy="290" r="7" fill="#FFD4A3"/>
                {/* Fingers */}
                <ellipse cx="307" cy="287" rx="2" ry="4" fill="#FFD4A3"/>
                <ellipse cx="310" cy="286" rx="2" ry="5" fill="#FFD4A3"/>
                <ellipse cx="313" cy="287" rx="2" ry="4" fill="#FFD4A3"/>
              </g>
              {/* Pants with seam */}
              <rect x="265" y="310" width="30" height="40" fill="#4A90E2" rx="3"/>
              <line x1="280" y1="315" x2="280" y2="345" stroke="#3A7BC8" strokeWidth="2"/>
              <rect x="267" y="312" width="5" height="35" fill="#5AA0F2" opacity="0.3"/>
              {/* Shoes with detail */}
              <ellipse cx="272" cy="350" rx="9" ry="4" fill="#2C3E50"/>
              <ellipse cx="272" cy="349" rx="7" ry="2" fill="#34495E"/>
              <line x1="268" y1="350" x2="276" y2="350" stroke="#1A252F" strokeWidth="1"/>
              <ellipse cx="288" cy="350" rx="9" ry="4" fill="#2C3E50"/>
              <ellipse cx="288" cy="349" rx="7" ry="2" fill="#34495E"/>
              <line x1="284" y1="350" x2="292" y2="350" stroke="#1A252F" strokeWidth="1"/>
            </g>

            {/* Person 4 - Right (Orange shirt with headphones) */}
            <g>
              <animateTransform attributeName="transform" type="translate" values="0,0; 0,-9; 0,0" dur="3.2s" begin="0.9s" repeatCount="indefinite"/>
              {/* Shadow */}
              <ellipse cx="360" cy="350" rx="22" ry="6" fill="rgba(0,0,0,0.15)">
                <animate attributeName="rx" values="22;18;22" dur="3.2s" begin="0.9s" repeatCount="indefinite"/>
              </ellipse>
              {/* Body with shading */}
              <ellipse cx="360" cy="280" rx="25" ry="35" fill="#FF9966"/>
              <ellipse cx="355" cy="275" rx="8" ry="15" fill="#FF8855" opacity="0.3"/>
              {/* Shirt collar */}
              <path d="M 352 260 L 348 268 L 352 270" fill="#FF7744"/>
              <path d="M 368 260 L 372 268 L 368 270" fill="#FF7744"/>
              {/* Neck */}
              <rect x="352" y="250" width="16" height="10" fill="#FFD4A3" rx="3"/>
              {/* Head */}
              <circle cx="360" cy="230" r="25" fill="#FFD4A3">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </circle>
              {/* Ears - visible under headphones */}
              <ellipse cx="335" cy="230" rx="4" ry="6" fill="#FFD4A3">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="336" cy="230" rx="2" ry="3" fill="#FFCF9F">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="385" cy="230" rx="4" ry="6" fill="#FFD4A3">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="384" cy="230" rx="2" ry="3" fill="#FFCF9F">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </ellipse>
              {/* Hair - Simple short style */}
              <ellipse cx="360" cy="215" rx="28" ry="20" fill="#4A4A4A">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="355" cy="210" rx="12" ry="15" fill="#5A5A5A">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="365" cy="210" rx="12" ry="15" fill="#5A5A5A">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </ellipse>
              {/* Headphones */}
              <path d="M 335 225 Q 335 208 360 208 Q 385 208 385 225" stroke="#4A90E2" strokeWidth="7" fill="none" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </path>
              <circle cx="335" cy="228" r="9" fill="#4A90E2">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="335" cy="228" r="6" fill="#3A7BC8">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="385" cy="228" r="9" fill="#4A90E2">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="385" cy="228" r="6" fill="#3A7BC8">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </circle>
              {/* Eyes */}
              <circle cx="355" cy="228" r="4" fill="#333">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="356" cy="227" r="1.5" fill="white">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="365" cy="228" r="4" fill="#333">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="366" cy="227" r="1.5" fill="white">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </circle>
              {/* Rosy cheeks */}
              <circle cx="348" cy="235" r="5" fill="#FF9999" opacity="0.4">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="372" cy="235" r="5" fill="#FF9999" opacity="0.4">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </circle>
              {/* Smile */}
              <path d="M 352 238 Q 360 244 368 238" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" values="0 360 230; -5 360 230; 5 360 230; 0 360 230" dur="4s" repeatCount="indefinite"/>
              </path>
              {/* Arms up */}
              <line x1="335" y1="260" x2="320" y2="240" stroke="#FFD4A3" strokeWidth="10" strokeLinecap="round">
                <animate attributeName="y2" values="240;235;240" dur="2.5s" repeatCount="indefinite"/>
              </line>
              <line x1="385" y1="260" x2="400" y2="240" stroke="#FFD4A3" strokeWidth="10" strokeLinecap="round">
                <animate attributeName="y2" values="240;235;240" dur="2.5s" repeatCount="indefinite"/>
              </line>
              {/* Hands with fingers */}
              <g>
                <circle cx="320" cy="240" r="7" fill="#FFD4A3">
                  <animate attributeName="cy" values="240;235;240" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <ellipse cx="317" cy="237" rx="2" ry="4" fill="#FFD4A3">
                  <animate attributeName="cy" values="237;232;237" dur="2.5s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="320" cy="236" rx="2" ry="5" fill="#FFD4A3">
                  <animate attributeName="cy" values="236;231;236" dur="2.5s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="323" cy="237" rx="2" ry="4" fill="#FFD4A3">
                  <animate attributeName="cy" values="237;232;237" dur="2.5s" repeatCount="indefinite"/>
                </ellipse>
              </g>
              <g>
                <circle cx="400" cy="240" r="7" fill="#FFD4A3">
                  <animate attributeName="cy" values="240;235;240" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <ellipse cx="397" cy="237" rx="2" ry="4" fill="#FFD4A3">
                  <animate attributeName="cy" values="237;232;237" dur="2.5s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="400" cy="236" rx="2" ry="5" fill="#FFD4A3">
                  <animate attributeName="cy" values="236;231;236" dur="2.5s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="403" cy="237" rx="2" ry="4" fill="#FFD4A3">
                  <animate attributeName="cy" values="237;232;237" dur="2.5s" repeatCount="indefinite"/>
                </ellipse>
              </g>
              {/* Pants with seam */}
              <rect x="345" y="310" width="30" height="40" fill="#4A90E2" rx="3"/>
              <line x1="360" y1="315" x2="360" y2="345" stroke="#3A7BC8" strokeWidth="2"/>
              <rect x="347" y="312" width="5" height="35" fill="#5AA0F2" opacity="0.3"/>
              {/* Shoes with detail */}
              <ellipse cx="352" cy="350" rx="9" ry="4" fill="#2C3E50"/>
              <ellipse cx="352" cy="349" rx="7" ry="2" fill="#34495E"/>
              <line x1="348" y1="350" x2="356" y2="350" stroke="#1A252F" strokeWidth="1"/>
              <ellipse cx="368" cy="350" rx="9" ry="4" fill="#2C3E50"/>
              <ellipse cx="368" cy="349" rx="7" ry="2" fill="#34495E"/>
              <line x1="364" y1="350" x2="372" y2="350" stroke="#1A252F" strokeWidth="1"/>
              {/* Music notes */}
              <text x="330" y="200" fontSize="18" fill="rgba(255,255,255,0.7)">♪
                <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="y" values="200;180;200" dur="2s" repeatCount="indefinite"/>
              </text>
              <text x="390" y="210" fontSize="16" fill="rgba(255,255,255,0.7)">♫
                <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                <animate attributeName="y" values="210;190;210" dur="2s" begin="0.5s" repeatCount="indefinite"/>
              </text>
            </g>

          </svg>

          {/* Attractive phrase */}
          <div className="mt-12 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Partagez vos dépenses,<br />
              <span className="text-white/90">pas vos soucis</span>
            </h2>
            <p className="text-xl text-white/80 max-w-lg mx-auto">
              La façon la plus simple de gérer l'argent entre amis
            </p>
          </div>
        </div>


      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div 
        className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white relative"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.22, 1, 0.36, 1],
          delay: 0.1
        }}
      >
        {/* Bouton retour à l'accueil */}
        <Link 
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">Accueil</span>
        </Link>

        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">💰</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">MiniSplit</h1>
            </div>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Bon retour !</h2>
            <p className="text-lg text-gray-600">Connectez-vous à votre compte</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-in slide-in-from-left-2">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 text-base rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 text-base rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                'Se connecter'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Nouveau sur MiniSplit ?</span>
              </div>
            </div>

            <Link href="/auth/register">
              <Button 
                type="button"
                variant="outline"
                className="w-full h-14 text-base font-semibold rounded-xl border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300"
              >
                Créer un compte
              </Button>
            </Link>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
