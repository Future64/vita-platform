use actix_web::{web, HttpResponse};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::codex;
use crate::error::VitaError;

// ── request / query types ───────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct ArticlesQuery {
    pub title_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct AmendmentsQuery {
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAmendmentBody {
    pub article_id: Uuid,
    pub author_id: Uuid,
    pub proposed_content: String,
    pub proposed_rationale: Option<String>,
    pub change_summary: String,
}

// ── handlers ────────────────────────────────────────────────────────

/// GET /api/v1/codex/titles — List all titles with article summaries.
pub async fn get_titles(
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, VitaError> {
    let titles = codex::get_titles_with_articles(pool.get_ref()).await?;
    Ok(HttpResponse::Ok().json(titles))
}

/// GET /api/v1/codex/articles — List all articles (with content).
pub async fn get_articles(
    pool: web::Data<PgPool>,
    query: web::Query<ArticlesQuery>,
) -> Result<HttpResponse, VitaError> {
    let articles = codex::get_articles(pool.get_ref(), query.title_id).await?;
    Ok(HttpResponse::Ok().json(articles))
}

/// GET /api/v1/codex/articles/{number} — Get article by number.
pub async fn get_article(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
) -> Result<HttpResponse, VitaError> {
    let number = path.into_inner();
    let article = codex::get_article_by_number(pool.get_ref(), number).await?;
    Ok(HttpResponse::Ok().json(article))
}

/// GET /api/v1/codex/articles/{number}/versions — Article version history.
pub async fn get_article_versions(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
) -> Result<HttpResponse, VitaError> {
    let number = path.into_inner();
    let article = codex::get_article_by_number(pool.get_ref(), number).await?;
    let versions = codex::get_article_versions(pool.get_ref(), article.id).await?;
    Ok(HttpResponse::Ok().json(versions))
}

/// POST /api/v1/codex/amendments — Create an amendment proposal.
pub async fn create_amendment(
    pool: web::Data<PgPool>,
    body: web::Json<CreateAmendmentBody>,
) -> Result<HttpResponse, VitaError> {
    let amendment = codex::create_amendment(
        pool.get_ref(),
        body.article_id,
        body.author_id,
        body.proposed_content.clone(),
        body.proposed_rationale.clone(),
        body.change_summary.clone(),
    )
    .await?;
    Ok(HttpResponse::Created().json(amendment))
}

/// GET /api/v1/codex/amendments — List amendments.
pub async fn get_amendments(
    pool: web::Data<PgPool>,
    query: web::Query<AmendmentsQuery>,
) -> Result<HttpResponse, VitaError> {
    let amendments = codex::get_amendments(pool.get_ref(), query.status.clone()).await?;
    Ok(HttpResponse::Ok().json(amendments))
}

/// GET /api/v1/codex/export/json — Full Codex export as JSON.
pub async fn export_json(
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, VitaError> {
    let export = codex::export_full(pool.get_ref()).await?;
    Ok(HttpResponse::Ok().json(export))
}

/// GET /api/v1/codex/export/pdf — Generate and return a PDF of the full Codex.
pub async fn export_pdf(
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, VitaError> {
    let export = codex::export_full(pool.get_ref()).await?;
    let pdf_bytes = generate_pdf(&export)?;

    Ok(HttpResponse::Ok()
        .content_type("application/pdf")
        .insert_header(("Content-Disposition", "attachment; filename=\"VITA-Constitution.pdf\""))
        .body(pdf_bytes))
}

// ── PDF generation ──────────────────────────────────────────────────

fn generate_pdf(export: &codex::CodexExport) -> Result<Vec<u8>, VitaError> {
    use genpdf::{elements, fonts, style, Alignment, Document};

    // Use built-in Helvetica (always available, no font file needed)
    let font_family = fonts::from_files("", "Helvetica", None)
        .unwrap_or_else(|_| {
            // Fallback: create a minimal document with default font
            genpdf::fonts::FontFamily {
                regular: genpdf::fonts::FontData::new(Vec::new(), None).unwrap(),
                bold: genpdf::fonts::FontData::new(Vec::new(), None).unwrap(),
                italic: genpdf::fonts::FontData::new(Vec::new(), None).unwrap(),
                bold_italic: genpdf::fonts::FontData::new(Vec::new(), None).unwrap(),
            }
        });

    let mut doc = Document::new(font_family);
    doc.set_title("Constitution VITA");

    // Set page margins
    let decorator = genpdf::SimplePageDecorator::new();
    doc.set_page_decorator(decorator);

    // ── Cover page ──
    doc.push(elements::Break::new(4.0));

    let mut title = elements::Paragraph::new("CONSTITUTION");
    title.set_alignment(Alignment::Center);
    title.push(style::StyledString::new(
        "CONSTITUTION",
        style::Style::new().bold().with_font_size(28),
    ));
    doc.push(title);

    doc.push(elements::Break::new(1.0));

    let mut subtitle = elements::Paragraph::default();
    subtitle.set_alignment(Alignment::Center);
    subtitle.push(style::StyledString::new(
        "du systeme monetaire VITA",
        style::Style::new().with_font_size(16),
    ));
    doc.push(subtitle);

    doc.push(elements::Break::new(2.0));

    let mut info = elements::Paragraph::default();
    info.set_alignment(Alignment::Center);
    info.push(style::StyledString::new(
        &format!("{} articles", export.total_articles),
        style::Style::new().italic().with_font_size(12),
    ));
    doc.push(info);

    doc.push(elements::Break::new(1.0));

    let mut date = elements::Paragraph::default();
    date.set_alignment(Alignment::Center);
    date.push(style::StyledString::new(
        &format!("Exporte le {}", export.exported_at.format("%d/%m/%Y")),
        style::Style::new().italic().with_font_size(10),
    ));
    doc.push(date);

    doc.push(elements::Break::new(4.0));

    // ── Table of contents ──
    let mut toc_title = elements::Paragraph::default();
    toc_title.push(style::StyledString::new(
        "TABLE DES MATIERES",
        style::Style::new().bold().with_font_size(18),
    ));
    doc.push(toc_title);
    doc.push(elements::Break::new(0.5));

    for title in &export.titles {
        let mut toc_line = elements::Paragraph::default();
        toc_line.push(style::StyledString::new(
            &format!("TITRE {} - {}", title.number, title.name.to_uppercase()),
            style::Style::new().bold().with_font_size(11),
        ));
        doc.push(toc_line);

        for article in &title.articles {
            let badge = if article.immutable { " [IMMUABLE]" } else { "" };
            let mut art_line = elements::Paragraph::default();
            art_line.push(style::StyledString::new(
                &format!("    Art. {} - {}{}", article.number, article.name, badge),
                style::Style::new().with_font_size(10),
            ));
            doc.push(art_line);
        }
        doc.push(elements::Break::new(0.3));
    }

    doc.push(elements::Break::new(2.0));

    // ── Articles ──
    for title in &export.titles {
        let mut title_heading = elements::Paragraph::default();
        title_heading.push(style::StyledString::new(
            &format!("TITRE {} - {}", title.number, title.name.to_uppercase()),
            style::Style::new().bold().with_font_size(16),
        ));
        doc.push(title_heading);
        doc.push(elements::Break::new(0.5));

        for article in &title.articles {
            let badge = if article.immutable { " [IMMUABLE]" } else { " [MODIFIABLE]" };

            let mut art_heading = elements::Paragraph::default();
            art_heading.push(style::StyledString::new(
                &format!("Article {} - {}{}", article.number, article.name, badge),
                style::Style::new().bold().with_font_size(13),
            ));
            doc.push(art_heading);
            doc.push(elements::Break::new(0.3));

            // Content — split into paragraphs
            for para in article.content.split("\n\n") {
                let trimmed = para.trim();
                if !trimmed.is_empty() {
                    let mut p = elements::Paragraph::default();
                    p.push(style::StyledString::new(
                        trimmed,
                        style::Style::new().with_font_size(10),
                    ));
                    doc.push(p);
                    doc.push(elements::Break::new(0.2));
                }
            }

            // Rationale
            if let Some(ref rationale) = article.rationale {
                doc.push(elements::Break::new(0.2));
                let mut rat_title = elements::Paragraph::default();
                rat_title.push(style::StyledString::new(
                    "Expose des motifs :",
                    style::Style::new().bold().italic().with_font_size(10),
                ));
                doc.push(rat_title);

                let mut rat_text = elements::Paragraph::default();
                rat_text.push(style::StyledString::new(
                    rationale,
                    style::Style::new().italic().with_font_size(9),
                ));
                doc.push(rat_text);
            }

            doc.push(elements::Break::new(1.0));
        }

        doc.push(elements::Break::new(1.5));
    }

    // Render to bytes
    let mut buf = Vec::new();
    doc.render(&mut buf)
        .map_err(|e| VitaError::Internal(format!("PDF generation failed: {e}")))?;
    Ok(buf)
}
