import {
  AngularNodeAppEngine, createNodeRequestHandler,
  isMainModule, writeResponseToNodeResponse,
} from '@angular/ssr/node';
import { join } from 'node:path';
import express, { Request, Response, NextFunction } from 'express';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
app.disable(`x-powered-by`);

const staticConfig = {
  maxAge: '1y',
  index: false,
  redirect: false,
};

app.use((req: Request, _: Response, next: NextFunction) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

app.use(express.static(browserDistFolder, staticConfig));
app.use('/panel', express.static(browserDistFolder, staticConfig));

app.use((req: Request, res: Response, next: NextFunction) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.accepts(`html`)) {
    res.sendFile(join(browserDistFolder, `index.html`));
  } else {
    next();
  }
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);