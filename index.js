const fs = require("fs");
const path = require("path");
const translate = require("google-translate-api-x");

async function updateI18nFiles(dirPath, labelName, enValue) {
  const failedTranslations = []; 

  try {
      if (!fs.existsSync(dirPath)) {
          console.error("Diretório não encontrado.");
          return;
      }

      const files = fs.readdirSync(dirPath).filter(file => file.endsWith(".json"));

      if (files.length === 0) {
          console.error("Nenhum arquivo JSON encontrado no diretório.");
          return;
      }

      for (const file of files) {
          const filePath = path.join(dirPath, file);

          const language = path.basename(file, ".json");

          const rawContent = fs.readFileSync(filePath, "utf-8");
          const fileContent = rawContent.trim() ? JSON.parse(rawContent) : null;

          if (!fileContent || Object.keys(fileContent).length === 0) {
              console.log(`Arquivo vazio ou sem conteúdo relevante: ${file}`);
              continue;
          }

          if (fileContent[labelName]) {
            console.log(`A label "${labelName}" já existe em ${file}. Atualizando valor.`);
            
            try {
                const translatedValue =
                    language === "en"
                        ? enValue
                        : (await translate(enValue, { from: "en", to: language })).text;
        
                fileContent[labelName] = translatedValue;
        
                fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
                console.log(`Atualizado valor da label "${labelName}" em ${file}`);
            } catch (translateError) {
                console.error(`Falha ao traduzir e atualizar para ${language} no arquivo ${file}:`, translateError.message);
                failedTranslations.push(file);
            }
        
            continue;
        }
          try {
              const translatedValue =
                  language === "en"
                      ? enValue
                      : (await translate(enValue, { from: "en", to: language })).text;

              const entries = Object.entries(fileContent);

              const insertIndex = entries.findIndex(([key]) => key.localeCompare(labelName) > 0);

              if (insertIndex !== -1) {
                  entries.splice(insertIndex, 0, [labelName, translatedValue]);
              } else {
                  entries.push([labelName, translatedValue]);
              }

              const sortedContent = Object.fromEntries(entries);

              fs.writeFileSync(filePath, JSON.stringify(sortedContent, null, 2));
              console.log(`Adicionada label "${labelName}" em ${file}`);
          } catch (translateError) {
              console.error(`Falha ao traduzir para ${language} no arquivo ${file}:`, translateError.message);
              failedTranslations.push(file);
          }
      }

      
      if (failedTranslations.length > 0) {
          console.log("\nArquivos com falha na tradução:");
          failedTranslations.forEach(file => console.log(`- ${file}`));
      }
  } catch (error) {
      console.error("Erro ao processar os arquivos:", error);
  }
}

// Uso do script
const dirPath = ""; // Path for i18n folder
const labelName = ""; //  label name
const enValue = ""; // Valor in english

updateI18nFiles(dirPath, labelName, enValue);