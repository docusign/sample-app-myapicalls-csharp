#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY DocuSign.MyAPI DocuSign.MyAPI/
COPY DocuSign.MyAPI.Domain DocuSign.MyAPI.Domain/
WORKDIR /src/DocuSign.MyAPI 
RUN dotnet restore "DocuSign.MyAPI.csproj"
RUN dotnet build "DocuSign.MyAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN apt-get update -yq && apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN dotnet publish "DocuSign.MyAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DocuSign.MyAPI.dll"]
