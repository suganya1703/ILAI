const fs = require('fs');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="#FFFFFF" rx="16" />
  <rect x="2" y="2" width="396" height="396" fill="none" stroke="#E2DCCB" stroke-width="4" rx="14" />
  
  <!-- Header -->
  <path d="M 2 2 L 398 2 L 398 50 L 2 50 Z" fill="#506638" />
  <text x="200" y="32" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ILAI SUSTAINABLE FEMCARE</text>
  
  <!-- Corner Finder 1 (Top Left) -->
  <rect x="75" y="70" width="60" height="60" fill="#263618" />
  <rect x="84" y="79" width="42" height="42" fill="#FFFFFF" />
  <rect x="93" y="88" width="24" height="24" fill="#263618" />
  
  <!-- Corner Finder 2 (Top Right) -->
  <rect x="265" y="70" width="60" height="60" fill="#263618" />
  <rect x="274" y="79" width="42" height="42" fill="#FFFFFF" />
  <rect x="283" y="88" width="24" height="24" fill="#263618" />
  
  <!-- Corner Finder 3 (Bottom Left) -->
  <rect x="75" y="260" width="60" height="60" fill="#263618" />
  <rect x="84" y="269" width="42" height="42" fill="#FFFFFF" />
  <rect x="93" y="278" width="24" height="24" fill="#263618" />

  <!-- Data Modules -->
  <g fill="#263618">
    <rect x="150" y="70" width="12" height="12" />
    <rect x="174" y="70" width="12" height="12" />
    <rect x="198" y="70" width="12" height="12" />
    <rect x="222" y="70" width="12" height="12" />
    
    <rect x="162" y="94" width="12" height="12" />
    <rect x="186" y="94" width="12" height="12" />
    <rect x="210" y="94" width="12" height="12" />
    
    <rect x="150" y="118" width="12" height="12" />
    <rect x="174" y="118" width="12" height="12" />
    <rect x="234" y="118" width="12" height="12" />

    <rect x="75" y="150" width="12" height="12" />
    <rect x="99" y="150" width="12" height="12" />
    <rect x="123" y="150" width="12" height="12" />
    <rect x="162" y="150" width="12" height="12" />
    <rect x="186" y="150" width="12" height="12" />
    <rect x="222" y="150" width="12" height="12" />
    <rect x="265" y="150" width="12" height="12" />
    <rect x="289" y="150" width="12" height="12" />
    <rect x="313" y="150" width="12" height="12" />

    <rect x="87" y="174" width="12" height="12" />
    <rect x="111" y="174" width="12" height="12" />
    <rect x="150" y="174" width="12" height="12" />
    <rect x="234" y="174" width="12" height="12" />
    <rect x="277" y="174" width="12" height="12" />
    <rect x="301" y="174" width="12" height="12" />

    <rect x="75" y="198" width="12" height="12" />
    <rect x="99" y="198" width="12" height="12" />
    <rect x="135" y="198" width="12" height="12" />
    <rect x="253" y="198" width="12" height="12" />
    <rect x="289" y="198" width="12" height="12" />
    <rect x="313" y="198" width="12" height="12" />

    <rect x="87" y="222" width="12" height="12" />
    <rect x="123" y="222" width="12" height="12" />
    <rect x="162" y="222" width="12" height="12" />
    <rect x="186" y="222" width="12" height="12" />
    <rect x="222" y="222" width="12" height="12" />
    <rect x="277" y="222" width="12" height="12" />
    <rect x="301" y="222" width="12" height="12" />

    <rect x="150" y="260" width="12" height="12" />
    <rect x="174" y="260" width="12" height="12" />
    <rect x="198" y="260" width="12" height="12" />
    <rect x="222" y="260" width="12" height="12" />
    <rect x="265" y="260" width="12" height="12" />
    <rect x="289" y="260" width="12" height="12" />

    <rect x="162" y="284" width="12" height="12" />
    <rect x="210" y="284" width="12" height="12" />
    <rect x="277" y="284" width="12" height="12" />
    <rect x="301" y="284" width="12" height="12" />

    <rect x="150" y="308" width="12" height="12" />
    <rect x="186" y="308" width="12" height="12" />
    <rect x="234" y="308" width="12" height="12" />
    <rect x="265" y="308" width="12" height="12" />
    <rect x="313" y="308" width="12" height="12" />
  </g>

  <!-- Center Badge -->
  <circle cx="200" cy="195" r="24" fill="#E8A2A4" stroke="#506638" stroke-width="2" />
  <text x="200" y="200" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#263618" text-anchor="middle">ILAI</text>

  <!-- Footer Info -->
  <text x="200" y="352" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#506638" text-anchor="middle">UPI ID: ilai@upi</text>
  <text x="200" y="375" font-family="Arial, sans-serif" font-size="10" fill="#5F6F50" text-anchor="middle">Scan with GPay / PhonePe / Paytm / BHIM</text>
</svg>`;

fs.writeFileSync('public/images/ilai-upi-qr.svg', svgContent);
fs.writeFileSync('public/images/ilai-upi-qr.png', svgContent);
console.log('Saved SVG & PNG QR code image!');
