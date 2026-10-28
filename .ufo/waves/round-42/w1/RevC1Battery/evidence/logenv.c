#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
__attribute__((constructor)) static void dump(void){
  const char *out = getenv("SHIM_LOG");
  const char *p = out ? out : "/fast/scratch/hyaku/tabi-r42/RevC1Battery/preload-log.txt";
  FILE *f = fopen(p, "a");
  if (!f) return;
  const char *keys[] = {"LD_PRELOAD","NODE_OPTIONS","NODE_PATH","NODE_V8_COVERAGE","BASH_ENV","OPENSSL_CONF","PATH","FONTCONFIG_FILE",NULL};
  fprintf(f, "pid=%d ppid=%d exe=", (int)getpid(), (int)getppid());
  char b[4096]; ssize_t n = readlink("/proc/self/exe", b, sizeof b - 1); if (n>0){b[n]=0;fprintf(f,"%s",b);} 
  fprintf(f, "", "");
  for (int i=0; keys[i]; i++) fprintf(f, " %s=%s", keys[i], getenv(keys[i]) ? "SET" : "unset");
  fprintf(f, "\n"); fclose(f);
}
