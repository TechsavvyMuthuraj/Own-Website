export interface ArticleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultTitle: string;
  defaultExcerpt: string;
  defaultTags: string[];
  content: string;
}

export const ARTICLE_TEMPLATES: ArticleTemplate[] = [
  {
    id: "java-sql-tutorial",
    name: "Java & SQL Full Tutorial",
    description: "Deep technical guide combining modern Java code, JDBC/JPA, and optimized SQL queries.",
    category: "Tutorial",
    defaultTitle: "Java and SQL: Comprehensive Database Engineering Guide",
    defaultExcerpt: "Master the integration of modern Java and SQL databases. Learn connection pooling, prepared statements, ACID transactions, and index optimizations.",
    defaultTags: ["Java", "SQL", "Databases", "Backend", "Performance"],
    content: `## Introduction: Why Java and SQL Power Modern Systems

Java and SQL remain the bedrock of global enterprise backends. Whether you are building financial gateways, inventory pipelines, or cloud applications, understanding how the JVM communicates with relational databases is paramount.

:::tip
Always use connection pooling (like HikariCP) in production. Creating a fresh physical TCP connection per query introduces catastrophic latency.
:::

---

## 1. Setting Up the Database Schema

Before writing Java code, ensure your database table is defined with appropriate types, foreign keys, and indexes.

\`\`\`sql
-- Create an enterprise users table
CREATE TABLE IF NOT EXISTS system_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Crucial composite index for lookup speed
CREATE INDEX idx_system_users_email ON system_users(email);
\`\`\`

---

## 2. Java JDBC Connection with HikariCP

Here is how modern Java connects to a database safely using PreparedStatements to guarantee protection against SQL injection attacks.

\`\`\`java
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class DatabaseManager {

    public static void fetchActiveUser(Connection conn, String email) throws SQLException {
        String query = "SELECT id, username, email FROM system_users WHERE email = ? AND is_active = true";
        
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, email);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String userId = rs.getString("id");
                    String username = rs.getString("username");
                    System.out.println("User Found: " + username + " (" + userId + ")");
                } else {
                    System.out.println("No active user found with email: " + email);
                }
            }
        }
    }
}
\`\`\`

:::warning
Never concatenate user input directly into SQL strings. Always use parameterized \`PreparedStatement\` queries to prevent SQL injection vulnerabilities.
:::

---

## 3. Best Practices & Optimization Checklist

- **Use Connection Pooling:** Minimize TCP handshake overhead.
- **Index High-Frequency WHERE Columns:** Ensure \`B-Tree\` indexes exist on search fields.
- **Manage Transactions:** Wrap multi-step mutations in explicit \`commit()\` and \`rollback()\` blocks.
- **Close Resources:** Always use \`try-with-resources\` in Java to prevent database connection leaks.
`,
  },
  {
    id: "software-guide",
    name: "Software Installation & Setup Guide",
    description: "Step-by-step setup walkthrough with prerequisites, screenshots, terminal commands, and verification.",
    category: "How-To",
    defaultTitle: "Complete Installation & Setup Guide for Developers",
    defaultExcerpt: "A verified walkthrough for setting up essential software and developer packages safely on Windows and Linux.",
    defaultTags: ["Software", "Setup", "Tools", "Guide", "Windows"],
    content: `## Overview

Getting your workstation configured properly saves countless hours of debugging down the road. In this walkthrough, we examine the official, verified setup workflow.

:::info
All software recommended in this article has been checked for cryptographic signatures and malware-free distribution.
:::

---

## Prerequisites

Before beginning, make sure your operating system meets the minimum specifications:

| Requirement | Minimum | Recommended |
| :--- | :--- | :--- |
| **OS** | Windows 10 (64-bit) / Ubuntu 22.04 | Windows 11 / Latest LTS |
| **RAM** | 8 GB | 16 GB or higher |
| **Disk** | 20 GB Free SSD | 50 GB NVMe Storage |

---

## Step 1: Terminal Installation & Environment Prep

Run the following command in your terminal to initialize dependencies:

\`\`\`bash
# Update package repositories
sudo apt-get update && sudo apt-get upgrade -y

# Verify runtime installation
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
\`\`\`

---

## Step 2: Verification Protocol

Confirm your setup by verifying the output:

\`\`\`bash
docker --version
docker run hello-world
\`\`\`

:::note
If you encounter permission issues on Linux, ensure your current user is added to the \`docker\` usergroup: \`sudo usermod -aG docker $USER\`.
:::
`,
  },
  {
    id: "news-announcement",
    name: "Tech News & Platform Update",
    description: "Editorial news format with key announcements, feature highlights, and release dates.",
    category: "News",
    defaultTitle: "NammaTech Journal: Latest Platform Updates & Major Features",
    defaultExcerpt: "Discover the newest enhancements, open-source utilities, and performance milestones available across NammaTech.",
    defaultTags: ["Announcement", "News", "NammaTech", "Updates"],
    content: `## What's New This Week

We are thrilled to roll out a major set of architectural improvements across NammaTech designed to give users even faster download speeds, richer technical articles, and upgraded personal support.

---

## Highlights at a Glance

- **High-Speed CDN Acceleration:** Direct downloads now stream across global edge nodes with lower latency.
- **Article Studio 2.0:** Deep-dive technical articles with native syntax highlighting and responsive code blocks.
- **Cryptographic File Audits:** Every published package is verified against official vendor SHA-256 hashes.

:::tip
Have a software or cinema request? Submit your ideas on our [Request Page](/request) and get notified as soon as it's published!
:::
`,
  },
  {
    id: "troubleshooting-guide",
    name: "Troubleshooting & Performance Fix",
    description: "Problem-solution format with symptoms, root causes, and verified fix steps.",
    category: "Troubleshooting",
    defaultTitle: "How to Diagnose & Fix High Memory Usage and System Freezes",
    defaultExcerpt: "Step-by-step diagnostic guide to locate memory leaks, kill runaway background services, and restore peak PC performance.",
    defaultTags: ["Troubleshooting", "Performance", "Windows", "Memory", "Fix"],
    content: `## The Problem: Unresponsive System & Memory Leaks

When applications fail to release allocated memory or background telemetry services spin out of control, system responsiveness plummets. Here is how to diagnose and resolve the issue.

---

## Step 1: Diagnose with Resource Monitor

1. Press \`Ctrl + Shift + Esc\` to open Task Manager.
2. Navigate to the **Performance** tab and click **Open Resource Monitor**.
3. Sort processes by **Commit (KB)** to find runaway allocations.

\`\`\`powershell
# Inspect top memory-consuming processes via PowerShell
Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 Name, WorkingSet64
\`\`\`

---

## Step 2: Clear Standby Memory & Background Cache

:::warning
Do not terminate core system processes such as \`svchost.exe\` or \`csrss.exe\` directly, as this will trigger an immediate blue-screen restart.
:::
`,
  },
];
