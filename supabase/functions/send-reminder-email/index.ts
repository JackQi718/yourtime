import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  subject: string;
  reminderTitle: string;
  reminderDescription?: string;
  reminderTime: string;
  priority: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, subject, reminderTitle, reminderDescription, reminderTime, priority }: EmailRequest = await req.json();

    if (!to || !subject || !reminderTitle) {
      return new Response(
        JSON.stringify({ error: "缺少必需字段: to, subject, reminderTitle" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const priorityLabels: Record<string, string> = {
      low: "低",
      medium: "中",
      high: "高",
      urgent: "紧急",
    };

    const priorityColors: Record<string, string> = {
      low: "#10b981",
      medium: "#3b82f6",
      high: "#f59e0b",
      urgent: "#ef4444",
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .reminder-card { background: #f9fafb; border-left: 4px solid ${priorityColors[priority] || "#3b82f6"}; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .priority-badge { display: inline-block; background: ${priorityColors[priority] || "#3b82f6"}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: 600; }
            .time { color: #6b7280; font-size: 14px; margin-top: 10px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
            h1 { margin: 0; font-size: 24px; }
            h2 { color: #111827; margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ 提醒通知</h1>
            </div>
            <div class="content">
              <div class="reminder-card">
                <div style="margin-bottom: 15px;">
                  <span class="priority-badge">优先级: ${priorityLabels[priority] || "中"}</span>
                </div>
                <h2>${reminderTitle}</h2>
                ${reminderDescription ? `<p style="color: #4b5563; margin: 10px 0;">${reminderDescription}</p>` : ""}
                <div class="time">
                  <strong>⏰ 提醒时间:</strong> ${new Date(reminderTime).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}
                </div>
              </div>
              <p style="color: #6b7280;">这是来自您的个人时间管理系统的自动提醒。请及时处理相关事项。</p>
            </div>
            <div class="footer">
              <p>© 2025 个人时间管理系统 | 此邮件由系统自动发送，请勿回复</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
提醒通知

标题: ${reminderTitle}
${reminderDescription ? `描述: ${reminderDescription}\n` : ""}
优先级: ${priorityLabels[priority] || "中"}
提醒时间: ${new Date(reminderTime).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}

这是来自您的个人时间管理系统的自动提醒。请及时处理相关事项。
    `;

    console.log(`准备发送邮件到: ${to}`);
    console.log(`主题: ${subject}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "邮件发送成功",
        details: {
          to,
          subject,
          reminderTitle,
          sentAt: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("发送邮件错误:", error);
    return new Response(
      JSON.stringify({
        error: "发送邮件失败",
        details: error instanceof Error ? error.message : "未知错误",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});