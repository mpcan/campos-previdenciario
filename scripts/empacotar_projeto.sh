#!/bin/bash

# Script para empacotar o projeto PowerPrev para entrega
# Este script cria um arquivo ZIP contendo todos os arquivos do projeto, exceto node_modules e outros arquivos desnecessários

echo "Iniciando empacotamento do projeto PowerPrev..."

# Definir diretório base
BASE_DIR="/home/ubuntu/prevgestao"
OUTPUT_DIR="/home/ubuntu"
OUTPUT_FILE="powerprev_mvp_zero.zip"

# Verificar se o diretório base existe
if [ ! -d "$BASE_DIR" ]; then
  echo "Erro: Diretório do projeto não encontrado em $BASE_DIR"
  exit 1
fi

# Criar o arquivo ZIP excluindo diretórios e arquivos desnecessários
echo "Criando arquivo ZIP do projeto..."
cd "$BASE_DIR"
zip -r "$OUTPUT_DIR/$OUTPUT_FILE" . -x "node_modules/*" ".next/*" ".git/*" "*.log" ".env*"

# Verificar se o ZIP foi criado com sucesso
if [ $? -eq 0 ]; then
  echo "Empacotamento concluído com sucesso!"
  echo "Arquivo criado: $OUTPUT_DIR/$OUTPUT_FILE"
  echo "Tamanho do arquivo: $(du -h $OUTPUT_DIR/$OUTPUT_FILE | cut -f1)"
else
  echo "Erro ao criar o arquivo ZIP"
  exit 1
fi

echo "Processo de empacotamento finalizado."
