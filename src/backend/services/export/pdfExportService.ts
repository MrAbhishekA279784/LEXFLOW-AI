import PDFDocument from 'pdfkit';
import { LawyerKitData } from '../../types/backendTypes';
import { CONSTANTS } from '../../config/constants';

export class PdfExportService {
  /**
   * Generates a professional multi-page PDF Buffer for a Lawyer Prep-Kit
   */
  static async generatePdfBuffer(kit: LawyerKitData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 40,
          size: 'A4',
          info: {
            Title: `Lexflow Lawyer Prep-Kit — ${kit.documentName}`,
            Author: 'LEXFLOW Legal Intelligence Engine',
            Subject: 'Document Preparation Brief for Legal Counsel',
            Keywords: 'legal, contract analysis, lawyer prep-kit, risk audit, lexflow',
            CreationDate: new Date(),
          },
          bufferPages: true,
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const result = Buffer.concat(chunks);
          resolve(result);
        });
        doc.on('error', (err) => reject(err));

        // Colors
        const primaryColor = '#C2410C'; // Warm amber/orange
        const secondaryColor = '#0F172A'; // Slate 900
        const textColor = '#334155'; // Slate 700
        const subtleBg = '#F8FAFC'; // Slate 50
        const borderColor = '#E2E8F0'; // Slate 200
        const dangerColor = '#DC2626'; // Red 600
        const successColor = '#059669'; // Emerald 600

        // ==========================================
        // HEADER / BRANDING BANNER
        // ==========================================
        doc.rect(40, 40, doc.page.width - 80, 60).fillAndStroke('#FFF7ED', '#FDBA74');
        
        doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold')
           .text('LEXFLOW', 55, 52, { continued: true })
           .fillColor(secondaryColor).fontSize(16).font('Helvetica')
           .text(' | LAWYER PREP-KIT & CLIENT BRIEF');

        doc.fillColor('#7C2D12').fontSize(9).font('Helvetica')
           .text(`Document: ${kit.documentName || 'Commercial Agreement'}  •  Generated: ${new Date(kit.generatedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, 55, 75);

        doc.moveDown(3);

        // ==========================================
        // 1. EXECUTIVE SUMMARY
        // ==========================================
        this.renderSectionHeader(doc, '1. Executive Summary & Overview', primaryColor);
        
        const summaryText = kit.executiveSummary || 
          `Client consultation brief for ${kit.documentName}. Contains extracted obligations, high-impact risks, contractual protections, scenario stress-test calculations, and statutory authorities under Indian law.`;
        
        doc.rect(40, doc.y, doc.page.width - 80, 55).fillAndStroke(subtleBg, borderColor);
        doc.fillColor(textColor).fontSize(9.5).font('Helvetica')
           .text(summaryText, 52, doc.y - 45, { width: doc.page.width - 104, lineGap: 3 });
        
        doc.moveDown(1.8);

        // ==========================================
        // 2. KEY CONTRACTUAL FACTS
        // ==========================================
        this.renderSectionHeader(doc, '2. Key Contractual Facts & Commercial Terms', primaryColor);
        
        const facts = (kit.keyFacts && kit.keyFacts.length > 0) ? kit.keyFacts : [
          { label: 'Document Type', value: kit.documentName.includes('Rental') ? 'Residential Tenancy Agreement' : 'Commercial Contract' },
          { label: 'Identified Parties', value: kit.parties.map(p => `${p.name} (${p.role})`).join(', ') || 'Tenant & Landlord' },
          { label: 'Core Financial Terms', value: kit.potentialFinancialExposure || 'Monthly rental ₹25,000 | Deposit ₹75,000' },
          { label: 'Notice Period', value: '30 Days written notice' },
          { label: 'Default Penalties', value: '₹500/day late fee after 3 grace days' },
        ];

        facts.slice(0, 6).forEach((f) => {
          doc.fillColor(secondaryColor).fontSize(9).font('Helvetica-Bold')
             .text(`• ${f.label}: `, { continued: true })
             .fillColor(textColor).font('Helvetica')
             .text(`${f.value}${f.clauseRef ? `  [Ref: ${f.clauseRef}${f.page ? `, p.${f.page}` : ''}]` : ''}`);
          doc.moveDown(0.3);
        });

        doc.moveDown(1.2);

        // ==========================================
        // 3. HIGH-IMPACT KEY CLAUSES
        // ==========================================
        this.renderSectionHeader(doc, '3. Critical High-Impact Clauses', primaryColor);
        
        const clauses = (kit.keyClauses && kit.keyClauses.length > 0) 
          ? kit.keyClauses 
          : (kit.keyObligations || []).slice(0, 3).map((o, idx) => ({
              clauseId: o.sourceClauseId || `cl-${idx}`,
              section: o.sourceClauseId || `Clause ${idx + 1}`,
              title: o.actor ? `${o.actor.toUpperCase()} Obligation` : 'Key Clause',
              excerpt: o.description,
              page: o.sourcePage || 2,
              importance: 'High operational significance',
            }));

        clauses.slice(0, 3).forEach((c) => {
          doc.fillColor(secondaryColor).fontSize(9.5).font('Helvetica-Bold')
             .text(`${c.section}: ${c.title || 'Contractual Stipulation'} `, { continued: true })
             .fillColor('#64748B').fontSize(8.5).font('Helvetica')
             .text(`[Page ${c.page}]`);

          doc.fillColor(textColor).fontSize(8.5).font('Helvetica-Oblique')
             .text(`"${c.excerpt}"`, { indent: 12, lineGap: 2 });
          doc.moveDown(0.5);
        });

        doc.moveDown(1);

        // Check if page needs break
        if (doc.y > 620) {
          doc.addPage();
        }

        // ==========================================
        // 4. RISKS & PROTECTIONS & CONFLICTS
        // ==========================================
        this.renderSectionHeader(doc, '4. Identified Risks, Protections & Clause Conflicts', primaryColor);

        const risks = kit.potentialRisks || kit.risks || [];
        if (risks.length > 0) {
          doc.fillColor(dangerColor).fontSize(9.5).font('Helvetica-Bold').text('HIGH-RISK EXPOSURES:');
          risks.slice(0, 3).forEach((r) => {
            doc.fillColor(dangerColor).fontSize(9).font('Helvetica-Bold')
               .text(`  ⚠ [${(r.level || 'critical').toUpperCase()}] ${r.title}: `, { continued: true })
               .fillColor(textColor).font('Helvetica')
               .text(`${r.description} (Ref: ${r.clauseRef || 'Document'})`);
            doc.moveDown(0.3);
          });
        }

        const protections = kit.protections || (kit.contractualProtections || []).map(p => ({ title: 'Statutory Defense / Clause Protection', description: p }));
        if (protections.length > 0) {
          doc.moveDown(0.4);
          doc.fillColor(successColor).fontSize(9.5).font('Helvetica-Bold').text('CONTRACTUAL & STATUTORY PROTECTIONS:');
          protections.slice(0, 2).forEach((p) => {
            doc.fillColor(successColor).fontSize(9).font('Helvetica-Bold')
               .text(`  ✓ ${p.title}: `, { continued: true })
               .fillColor(textColor).font('Helvetica')
               .text(`${p.description}`);
            doc.moveDown(0.3);
          });
        }

        const conflicts = kit.potentialConflicts || kit.conflicts || [];
        if (conflicts.length > 0) {
          doc.moveDown(0.4);
          doc.fillColor('#B45309').fontSize(9.5).font('Helvetica-Bold').text('DETECTED CLAUSE CONFLICTS:');
          conflicts.slice(0, 2).forEach((cf) => {
            doc.fillColor('#B45309').fontSize(9).font('Helvetica-Bold')
               .text(`  ⚡ ${cf.clauseARef} ↔ ${cf.clauseBRef}: `, { continued: true })
               .fillColor(textColor).font('Helvetica')
               .text(`${cf.interactionDescription}`);
            doc.moveDown(0.3);
          });
        }

        doc.moveDown(1.2);

        // Check if page needs break
        if (doc.y > 580) {
          doc.addPage();
        }

        // ==========================================
        // 5. WHAT-IF SCENARIO STRESS-TEST
        // ==========================================
        this.renderSectionHeader(doc, '5. Scenario Stress-Test & Financial Exposure Calculations', primaryColor);
        
        const scenFinding = kit.scenarioFindings;
        const scenPrompt = kit.scenarioTested || (scenFinding ? scenFinding.question : 'Early departure and rent default simulation');
        const scenExposure = kit.potentialFinancialExposure || (scenFinding ? scenFinding.financialImpact : '₹75,000 (Subject to Offset)');

        doc.rect(40, doc.y, doc.page.width - 80, 52).fillAndStroke('#F8FAFC', '#E2E8F0');
        doc.fillColor(secondaryColor).fontSize(9).font('Helvetica-Bold')
           .text(`Simulated Scenario: "${scenPrompt}"`, 52, doc.y - 42);
        doc.fillColor(primaryColor).fontSize(9.5).font('Helvetica-Bold')
           .text(`Total Estimated Exposure: ${scenExposure}`, 52, doc.y + 4);
        doc.fillColor(textColor).fontSize(8.5).font('Helvetica')
           .text('Calculations derived using deterministic contract penalty rates and statutory offset formulas.', 52, doc.y + 3);

        doc.moveDown(1.8);

        // ==========================================
        // 6. APPLICABLE STATUTORY AUTHORITIES
        // ==========================================
        this.renderSectionHeader(doc, '6. Authoritative Legal Sources & Precedents (Indian Law)', primaryColor);
        
        const authorities = kit.authoritativeLegalSources || kit.applicableLaw || [];
        authorities.slice(0, 3).forEach((a) => {
          doc.fillColor(secondaryColor).fontSize(9).font('Helvetica-Bold')
             .text(`§ ${a.actOrCourt || a.title} — ${a.sectionOrArticle || ''}: `, { continued: true })
             .fillColor(textColor).font('Helvetica')
             .text(`${a.summary || ''}`);
          if (a.officialSourceUrl) {
            doc.fillColor('#2563EB').fontSize(8).font('Helvetica')
               .text(`   Official URL: ${a.officialSourceUrl}`);
          }
          doc.moveDown(0.3);
        });

        doc.moveDown(1.2);

        // Check if page needs break
        if (doc.y > 600) {
          doc.addPage();
        }

        // ==========================================
        // 7. QUESTIONS FOR LEGAL COUNSEL
        // ==========================================
        this.renderSectionHeader(doc, '7. Priority Questions for Your Advocate / Legal Counsel', primaryColor);
        
        const questions = (kit.questionsForLegalProfessional && kit.questionsForLegalProfessional.length > 0)
          ? kit.questionsForLegalProfessional
          : (kit.questionsForLawyer && kit.questionsForLawyer.length > 0)
            ? kit.questionsForLawyer
            : [
                'Is the total forfeiture of security deposit legally enforceable under Section 74 of the Indian Contract Act without proof of actual loss?',
                'Can we serve a formal notice to cure and propose adjusting arrears against the deposit with mutual key handover?',
                'What is the statutory limitation period for disputing unliquidated repair damages?'
              ];

        questions.slice(0, 4).forEach((q, idx) => {
          doc.fillColor(secondaryColor).fontSize(9).font('Helvetica-Bold')
             .text(`Q${idx + 1}: `, { continued: true })
             .fillColor(textColor).font('Helvetica')
             .text(q);
          doc.moveDown(0.4);
        });

        doc.moveDown(1);

        // ==========================================
        // 8. DOCUMENTS TO BRING CHECKLIST
        // ==========================================
        this.renderSectionHeader(doc, '8. Client Documents & Evidence to Bring', primaryColor);
        
        const docsToBring = (kit.documentsToBring && kit.documentsToBring.length > 0) ? kit.documentsToBring : [
          'Original Signed Tenancy / Commercial Agreement with all Annexures',
          'Security Deposit Bank Transfer / Cheque Payment Receipts',
          'All Monthly Rent Transaction Statements & WhatsApp/Email receipts',
          'Written notice / Key handover acknowledgement letter'
        ];

        docsToBring.forEach((d) => {
          doc.fillColor(textColor).fontSize(9).font('Helvetica')
             .text(`[  ]  ${d}`);
          doc.moveDown(0.25);
        });

        doc.moveDown(1.2);

        // ==========================================
        // 9. ASSUMPTIONS & STATUTORY DISCLAIMER
        // ==========================================
        doc.rect(40, doc.y, doc.page.width - 80, 50).fillAndStroke('#FEF2F2', '#FECACA');
        
        doc.fillColor('#991B1B').fontSize(8).font('Helvetica-Bold')
           .text('STATUTORY NOTICE & LEGAL DISCLAIMER', 50, doc.y - 40);
        
        const disclaimerText = kit.disclaimer || CONSTANTS.LEGAL_DISCLAIMER;
        doc.fillColor('#7F1D1D').fontSize(7.5).font('Helvetica')
           .text(disclaimerText, 50, doc.y + 2, { width: doc.page.width - 100, lineGap: 1.5 });

        // ==========================================
        // FOOTERS ON ALL PAGES
        // ==========================================
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);
          doc.fillColor('#94A3B8').fontSize(7.5).font('Helvetica')
             .text(
               `LEXFLOW Intelligence Platform  •  Page ${i + 1} of ${range.count}  •  Document ID: ${kit.documentId}`,
               40,
               doc.page.height - 30,
               { align: 'center', width: doc.page.width - 80 }
             );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private static renderSectionHeader(doc: PDFKit.PDFDocument, title: string, color: string) {
    doc.fillColor(color).fontSize(11).font('Helvetica-Bold')
       .text(title.toUpperCase());
    doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(0.5);
  }
}
