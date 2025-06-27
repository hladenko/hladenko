import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()

    let subject = ''
    let htmlContent = ''

    switch (type) {
      case 'order':
        subject = `Nova narudžbina - ${data.orderNumber}`
        htmlContent = `
          <h2>Nova narudžbina je stigla!</h2>
          <p><strong>Broj narudžbine:</strong> ${data.orderNumber}</p>
          
          <h3>Informacije o kupcu:</h3>
          <p><strong>Ime:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Telefon:</strong> ${data.phone}</p>
          <p><strong>Email:</strong> ${data.email || 'Nije unet'}</p>
          
          <h3>Adresa za dostavu:</h3>
          <p>${data.address}</p>
          <p>${data.city}, ${data.postalCode}</p>
          
          <h3>Način plaćanja:</h3>
          <p>${data.paymentMethod === 'cash' ? 'Plaćanje pouzećem (gotovina)' : 'Plaćanje karticom kuriru'}</p>
          ${data.cashAmount ? `<p><strong>Iznos gotovine:</strong> $${data.cashAmount}</p>` : ''}
          ${data.change ? `<p><strong>Kusur:</strong> $${data.change}</p>` : ''}
          
          <h3>Naručeni proizvodi:</h3>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr>
              <th style="padding: 8px;">Proizvod</th>
              <th style="padding: 8px;">Količina</th>
              <th style="padding: 8px;">Cena</th>
              <th style="padding: 8px;">Ukupno</th>
            </tr>
            ${data.items.map(item => `
              <tr>
                <td style="padding: 8px;">${item.name}</td>
                <td style="padding: 8px;">${item.quantity}</td>
                <td style="padding: 8px;">$${item.price.toFixed(2)}</td>
                <td style="padding: 8px;">$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          
          <p><strong>Ukupna cena:</strong> $${data.total}</p>
          
          ${data.notes ? `<h3>Dodatne napomene:</h3><p>${data.notes}</p>` : ''}
        `
        break

      case 'newsletter':
        subject = 'Nova pretplata na newsletter'
        htmlContent = `
          <h2>Nova pretplata na newsletter!</h2>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Vreme:</strong> ${new Date().toLocaleString('sr-RS')}</p>
        `
        break

      case 'contact':
        subject = 'Nova poruka sa kontakt forme'
        htmlContent = `
          <h2>Nova poruka sa kontakt forme!</h2>
          <p><strong>Ime:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          
          <h3>Poruka:</h3>
          <p>${data.message}</p>
          
          <p><strong>Vreme:</strong> ${new Date().toLocaleString('sr-RS')}</p>
        `
        break

      default:
        throw new Error('Invalid email type')
    }

    // Send email using a service like Resend, SendGrid, or similar
    // For this example, I'll use a simple fetch to a hypothetical email service
    // You'll need to replace this with your actual email service
    
    const emailResponse = await fetch('https://hxnlcrljjlzlfgbbmgar.supabase.co', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bmxjcmxqamx6bGZnYmJtZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDQyOTksImV4cCI6MjA2NjYyMDI5OX0.yS31AF7WaJ7b3O0qCszK3QtZs-G0vElXyNjLlkxOznE')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@hladenko.com',
        to: ['hladenkobiznis@gmail.com'],
        subject: subject,
        html: htmlContent,
      }),
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
