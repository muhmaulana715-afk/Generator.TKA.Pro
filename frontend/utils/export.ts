import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, TabStopType
} from "docx";
import { GeneratedData } from '../types.ts';

// Helper: pecah array menjadi chunks
function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

function cellPCT(persen: number, teks: string, isBold: boolean) {
  return new TableCell({
    width: { size: persen, type: WidthType.PERCENTAGE },
    children: [new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [new TextRun({
        text: teks,
        font: "Calibri", size: 24,
        bold: isBold, color: "000000"
      })]
    })]
  });
}

export const downloadAsWord = async (soalData: GeneratedData, modeDenganKunci: boolean = false) => {
  const paragraphs: any[] = [];
  const totalSoal = soalData.kelompok_soal.reduce((acc, g) => acc + g.soal.length, 0);

  // --- COVER ---
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { fill: "FFF0F5", type: ShadingType.CLEAR },
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: "🎓 TES KEMAMPUAN AKADEMIK (TKA)",
          font: "Calibri",
          size: 24,
          bold: true,
          color: "4A90D9",
        })
      ]
    }),
    new Paragraph({
      border: { bottom: { style: BorderStyle.THICK, size: 12, color: "2ECC71", space: 4 } },
      spacing: { after: 360 },
      children: []
    })
  );

  const infoRows = [
    ["📚 MATA PELAJARAN", soalData.mata_pelajaran.toUpperCase()],
    ["🏫 JENJANG", soalData.jenjang],
    ["✏️ Jumlah Soal", `${totalSoal} Butir Pilihan Ganda`],
    ["⭐ Tingkat", "Standar TKA"]
  ];

  paragraphs.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
        insideH: { style: BorderStyle.NONE, size: 0 },
        insideV: { style: BorderStyle.NONE, size: 0 },
      },
      rows: infoRows.map(([label, nilai]) =>
        new TableRow({ children: [
          cellPCT(30, label, false),
          cellPCT(5, ":", false),
          cellPCT(65, nilai, true),
        ]})
      )
    })
  );

  const petunjuk = [
    "Bacalah setiap soal dengan seksama sebelum menjawab.",
    "Pilih satu jawaban yang paling tepat dari pilihan A, B, C, atau D.",
    "Kerjakan soal yang mudah terlebih dahulu.",
    "Periksa kembali jawabanmu sebelum dikumpulkan."
  ];

  paragraphs.push(
    new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top:    { style: BorderStyle.SINGLE, color: "4A90D9", size: 8 },
        bottom: { style: BorderStyle.SINGLE, color: "4A90D9", size: 8 },
        left:   { style: BorderStyle.SINGLE, color: "4A90D9", size: 8 },
        right:  { style: BorderStyle.SINGLE, color: "4A90D9", size: 8 },
      },
      rows: [new TableRow({ children: [
        new TableCell({
          shading: { fill: "F4F9FF", type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 80, left: 160, right: 160 },
          children: [
            new Paragraph({ spacing: { after: 120 }, children: [
              new TextRun({ text: "PETUNJUK PENGERJAAN:", font: "Calibri", size: 24, bold: true, color: "4A90D9" })
            ]}),
            ...petunjuk.map((teks, i) => new Paragraph({
              spacing: { after: 80 },
              children: [new TextRun({ text: `${i+1}. ${teks}`, font: "Calibri", size: 24, color: "000000" })]
            }))
          ]
        })
      ]})]
    })
  );

  paragraphs.push(
    new Paragraph({ spacing: { before: 360, after: 0 }, children: [] }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, color: "4A90D9", size: 4 },
        bottom: { style: BorderStyle.SINGLE, color: "4A90D9", size: 4 },
        left: { style: BorderStyle.SINGLE, color: "4A90D9", size: 4 },
        right: { style: BorderStyle.SINGLE, color: "4A90D9", size: 4 },
        insideH: { style: BorderStyle.SINGLE, color: "4A90D9", size: 4 },
        insideV: { style: BorderStyle.SINGLE, color: "4A90D9", size: 4 },
      },
      rows: [
        new TableRow({ children: [ cellPCT(20, "Nama", false), cellPCT(5, ":", false), cellPCT(75, "______________________________", false) ] }),
        new TableRow({ children: [ cellPCT(20, "Kelas", false), cellPCT(5, ":", false), cellPCT(75, "______________________________", false) ] }),
        new TableRow({ children: [ cellPCT(20, "Tanggal", false), cellPCT(5, ":", false), cellPCT(75, "______________________________", false) ] }),
      ]
    })
  );

  // --- BAGIAN A ---
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { fill: "4A90D9", type: ShadingType.CLEAR },
      spacing: { before: 320, after: 160 },
      children: [
        new TextRun({
          text: "✏️ BAGIAN A — SOAL PILIHAN GANDA",
          font: "Calibri", size: 24, bold: true, color: "FFFFFF"
        })
      ]
    })
  );

  soalData.kelompok_soal.forEach((group) => {
    if (group.teks_bacaan) {
      paragraphs.push(
        new Paragraph({
          border: {
            top:    { style: BorderStyle.SINGLE, size: 6,  color: "2ECC71", space: 4 },
            bottom: { style: BorderStyle.SINGLE, size: 6,  color: "2ECC71", space: 4 },
            left:   { style: BorderStyle.THICK,  size: 12, color: "2ECC71", space: 6 },
            right:  { style: BorderStyle.SINGLE, size: 6,  color: "2ECC71", space: 4 },
          },
          shading: { fill: "EAFAF1", type: ShadingType.CLEAR },
          spacing: { before: 240, after: 0, line: 360 },
          indent: { left: 120, right: 120 },
          children: [
            new TextRun({ text: "📖 TEKS BACAAN", font: "Calibri", size: 24, bold: true, color: "2ECC71" })
          ]
        }),
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6,  color: "2ECC71", space: 4 },
            left:   { style: BorderStyle.THICK,  size: 12, color: "2ECC71", space: 6 },
            right:  { style: BorderStyle.SINGLE, size: 6,  color: "2ECC71", space: 4 },
          },
          shading: { fill: "EAFAF1", type: ShadingType.CLEAR },
          spacing: { before: 0, after: 240, line: 360 },
          indent: { left: 120, right: 120 },
          children: [
            new TextRun({ text: group.teks_bacaan, font: "Calibri", size: 24, color: "000000" })
          ]
        })
      );

      const firstNum = group.soal[0]?.nomor;
      const lastNum = group.soal[group.soal.length - 1]?.nomor;
      const textRange = firstNum === lastNum ? `${firstNum}` : `${firstNum} s.d. ${lastNum}`;

      paragraphs.push(
        new Paragraph({
          spacing: { before: 80, after: 160 },
          children: [
            new TextRun({
              text: `📝 Soal nomor ${textRange} berdasarkan teks di atas.`,
              font: "Calibri", size: 24, italic: true, bold: true, color: "2ECC71"
            })
          ]
        })
      );
    }

    group.soal.forEach((soal) => {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 240, after: 80 },
          children: [
            new TextRun({
              text: ` Soal ${soal.nomor} `,
              font: "Calibri",
              size: 24,
              bold: true,
              color: "FFFFFF",
              highlight: "darkBlue",
            }),
            new TextRun({ text: "  ", size: 24 }),
            new TextRun({
              text: `(${soal.tag_utama} – ${soal.tag_sub})`,
              font: "Calibri",
              size: 20,
              color: "9B59B6",
            }),
          ]
        })
      );

      paragraphs.push(
        new Paragraph({
          spacing: { before: 80, after: 120, line: 360 },
          indent: { left: 360 },
          children: [
            new TextRun({
              text: soal.pertanyaan,
              font: "Calibri",
              size: 24,
              color: "000000",
            })
          ]
        })
      );

      const warnaHuruf: Record<string, string> = { A: "4A90D9", B: "2ECC71", C: "F0932B", D: "9B59B6" };
      (["A", "B", "C", "D"] as const).forEach(huruf => {
        paragraphs.push(
          new Paragraph({
            tabStops: [{ type: TabStopType.LEFT, position: 720 }],
            spacing: { before: 60, after: 60, line: 360 },
            indent: { left: 720, hanging: 360 },
            children: [
              new TextRun({
                text: `${huruf}.`,
                font: "Calibri",
                size: 24,
                bold: true,
                color: warnaHuruf[huruf],
              }),
              new TextRun({
                text: `\t${soal.pilihan[huruf]}`,
                font: "Calibri",
                size: 24,
                color: "000000",
              }),
            ]
          })
        );
      });

      paragraphs.push(
        new Paragraph({
          border: { bottom: { style: BorderStyle.DASHED, size: 4, color: "F9CA24", space: 4 } },
          spacing: { before: 240, after: 120 },
          children: []
        })
      );
    });
  });

  // --- BAGIAN B ---
  if (modeDenganKunci) {
    paragraphs.push(
      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        shading: { fill: "F0932B", type: ShadingType.CLEAR },
        spacing: { before: 0, after: 200 },
        children: [
          new TextRun({
            text: "🔑 BAGIAN B — KUNCI JAWABAN & PEMBAHASAN",
            font: "Calibri", size: 24, bold: true, color: "FFFFFF"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 320 },
        children: [
          new TextRun({
            text: `TKA ${soalData.mata_pelajaran} — ${soalData.jenjang} | ${totalSoal} Soal`,
            font: "Calibri", size: 24, italic: true, color: "F0932B"
          })
        ]
      })
    );

    const allSoal = soalData.kelompok_soal.flatMap(g => g.soal);
    const COL_W = 974;
    const TABLE_W = COL_W * 10;

    const headerCells = ["No.", "Kunci", "No.", "Kunci", "No.", "Kunci", "No.", "Kunci", "No.", "Kunci"].map((label, i) =>
      new TableCell({
        width: { size: COL_W, type: WidthType.DXA },
        shading: { fill: i % 2 === 0 ? "4A90D9" : "2ECC71", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: label, font: "Calibri", size: 20, bold: true, color: "FFFFFF" })]
        })]
      })
    );

    const tableRows = [new TableRow({ children: headerCells })];

    chunk(allSoal, 5).forEach((group, rowIdx) => {
      const cells: TableCell[] = [];
      for (let i = 0; i < 5; i++) {
        const soal = group[i];
        if (soal) {
          cells.push(
            new TableCell({
              width: { size: COL_W, type: WidthType.DXA },
              shading: { fill: rowIdx % 2 === 0 ? "FFFFFF" : "F8F9FA", type: ShadingType.CLEAR },
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `${soal.nomor}`, font: "Calibri", size: 20 })]
              })]
            }),
            new TableCell({
              width: { size: COL_W, type: WidthType.DXA },
              shading: { fill: rowIdx % 2 === 0 ? "FFFFFF" : "F8F9FA", type: ShadingType.CLEAR },
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({
                  text: soal.kunci,
                  font: "Calibri", size: 20, bold: true,
                  color: { A: "4A90D9", B: "2ECC71", C: "F0932B", D: "9B59B6" }[soal.kunci] || "000000"
                })]
              })]
            })
          );
        } else {
          cells.push(
            new TableCell({ width: { size: COL_W, type: WidthType.DXA }, children: [new Paragraph("")] }),
            new TableCell({ width: { size: COL_W, type: WidthType.DXA }, children: [new Paragraph("")] })
          );
        }
      }
      tableRows.push(new TableRow({ children: cells }));
    });

    paragraphs.push(
      new Table({
        width: { size: TABLE_W, type: WidthType.DXA },
        columnWidths: Array(10).fill(COL_W),
        rows: tableRows
      })
    );

    allSoal.forEach(soal => {
      const warnaKunci = { A: "4A90D9", B: "2ECC71", C: "F0932B", D: "9B59B6" }[soal.kunci] || "000000";

      paragraphs.push(new Paragraph({
        shading: { fill: "F8F9FA", type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.THICK, size: 12, color: warnaKunci, space: 6 } },
        spacing: { before: 280, after: 60 },
        indent: { left: 160 },
        children: [
          new TextRun({ text: `Soal ${soal.nomor}  `, font: "Calibri", size: 24, bold: true, color: "2D3436" }),
          new TextRun({
            text: `✅ Jawaban: ${soal.kunci}`,
            font: "Calibri", size: 24, bold: true, color: warnaKunci
          }),
          new TextRun({
            text: `   (${soal.tag_utama} – ${soal.tag_sub})`,
            font: "Calibri", size: 20, color: "9B59B6"
          }),
        ]
      }));

      paragraphs.push(new Paragraph({
        spacing: { before: 40, after: 60 },
        indent: { left: 320 },
        children: [new TextRun({
          text: soal.pertanyaan.length > 100
            ? soal.pertanyaan.substring(0, 97) + "..."
            : soal.pertanyaan,
          font: "Calibri", size: 20, italic: true, color: "636E72"
        })]
      }));

      paragraphs.push(new Paragraph({
        shading: { fill: "FFF9E6", type: ShadingType.CLEAR },
        border: {
          top:    { style: BorderStyle.SINGLE, size: 4, color: "F9CA24", space: 3 },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: "F9CA24", space: 3 },
          left:   { style: BorderStyle.THICK,  size: 10, color: "F9CA24", space: 6 },
          right:  { style: BorderStyle.SINGLE, size: 4, color: "F9CA24", space: 3 },
        },
        spacing: { before: 40, after: 200, line: 340 },
        indent: { left: 320, right: 240 },
        children: [
          new TextRun({ text: "💡 ", font: "Calibri", size: 24 }),
          new TextRun({ text: soal.pembahasan, font: "Calibri", size: 24, color: "2D3436" })
        ]
      }));
    });
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
        }
      },
      children: paragraphs
    }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const timestamp = new Date().toISOString().slice(0, 10);
  const suffix = modeDenganKunci ? "_denganKunci" : "";
  a.download = `TKA_${soalData.mata_pelajaran}_${soalData.jenjang}_${totalSoal}Soal_${timestamp}${suffix}.docx`;
  a.click();
  URL.revokeObjectURL(url);
};
