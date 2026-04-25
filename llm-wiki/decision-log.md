# Decision Log

## 1. 모바일 전체 감시 제외
**결정**: 다른 앱, 통화, 카카오톡, 키로깅 등 일체 구현하지 않음  
**이유**: 법적 위험(개인정보보호법, 통신비밀보호법), 사용자 신뢰 훼손, MVP 범위 초과  
**대안**: 웹앱 내부 이벤트만 기록. 범위가 명확하고 합법적임

## 2. IndexedDB 선택
**결정**: 클라이언트 저장소로 IndexedDB 사용 (idb 라이브러리)  
**이유**: PWA 오프라인 지원, 용량 제한 없음, Blob 저장 가능 (오디오)  
**대안 탈락**: localStorage — Blob 저장 불가, 용량 5MB 한계

## 3. GitHub Token 서버 전용
**결정**: GITHUB_TOKEN은 .env.local + API Route에서만 사용  
**이유**: 클라이언트 노출 시 repo 전체 접근 가능 → 심각한 보안 취약점  
**구현**: Next.js API Route가 프록시 역할, 프론트는 /api/* 경유만

## 4. Obsidian 직접 제어 대신 GitHub Vault 구조
**결정**: Obsidian 앱을 직접 제어하지 않고 GitHub repo를 Vault로 구성  
**이유**: Obsidian API 없음, 모바일에서 직접 파일 접근 불가  
**구현**: GitHub repo = Obsidian Vault → Obsidian Git 플러그인으로 pull

## 5. 오디오 원본 업로드 기본 OFF
**결정**: `uploadAudioToGithub` 기본값 false  
**이유**: 의도치 않은 개인 음성 데이터 외부 저장 방지, 사용자가 명시적으로 켜야 함

## 6. next-pwa 사용
**결정**: next-pwa로 Service Worker 자동 생성  
**이유**: PWA 설정을 직접 구현하는 것보다 안정적, Next.js와 통합 용이

## 7. MediaRecorder 1초 청크
**결정**: `recorder.start(1000)` — 1초 단위 데이터 수집  
**이유**: 긴 녹음에서 메모리 폭발 방지, 점진적 청크 수집
